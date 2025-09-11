import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from './types';
import { shopifyFetchServer } from './shopify-server';
import { CREATE_CART_MUTATION, ADD_TO_CART_MUTATION, UPDATE_CART_MUTATION, GET_CART_QUERY } from './queries';

interface CartStore {
  cartId: string | null;
  items: CartItem[];
  isOpen: boolean;
  totalQuantity: number;
  totalPrice: number;
  currencyCode: string;
  checkoutUrl: string | null;
  isLoading: boolean;
  
  // Actions
  addToCart: (variantId: string, quantity: number) => Promise<void>;
  updateCartItem: (variantId: string, quantity: number) => Promise<void>;
  removeFromCart: (variantId: string) => Promise<void>;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  refreshCart: () => Promise<void>;
}

// Client-side Shopify fetch function
const shopifyFetchClient = async ({ query, variables = {} }: { query: string; variables?: any }) => {
  const endpoint = `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`;
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.errors) {
      console.error('Shopify GraphQL errors:', result.errors);
      throw new Error('GraphQL errors occurred');
    }

    return { data: result.data };
  } catch (error) {
    console.error('Shopify Client API Error:', error);
    throw error;
  }
};

const parseCartData = (cart: any): { items: CartItem[], totalQuantity: number, totalPrice: number, currencyCode: string, checkoutUrl: string } => {
  if (!cart || !cart.lines || !cart.lines.edges) {
    return {
      items: [],
      totalQuantity: 0,
      totalPrice: 0,
      currencyCode: 'USD',
      checkoutUrl: ''
    };
  }

  const items: CartItem[] = cart.lines.edges.map((edge: any) => {
    const line = edge.node;
    const variant = line.merchandise;
    const product = variant.product;
    
    return {
      id: line.id,
      variantId: variant.id,
      productId: product.id,
      title: product.title,
      variantTitle: variant.title !== 'Default Title' ? variant.title : '',
      price: variant.price.amount,
      currencyCode: variant.price.currencyCode,
      image: product.images.edges[0]?.node.url || null,
      quantity: line.quantity,
      maxQuantity: 10,
    };
  });

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.cost?.totalAmount ? parseFloat(cart.cost.totalAmount.amount) : 0;
  const currencyCode = cart.cost?.totalAmount?.currencyCode || 'USD';
  const checkoutUrl = cart.checkoutUrl || '';

  return { items, totalQuantity, totalPrice, currencyCode, checkoutUrl };
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cartId: null,
      items: [],
      isOpen: false,
      totalQuantity: 0,
      totalPrice: 0,
      currencyCode: 'USD',
      checkoutUrl: null,
      isLoading: false,

      addToCart: async (variantId: string, quantity: number) => {
        set({ isLoading: true });
        try {
          const state = get();
          
          console.log('Adding to cart:', { variantId, quantity, currentCartId: state.cartId });
          
          if (!state.cartId) {
            // Create new cart
            console.log('Creating new cart with variant:', variantId, 'quantity:', quantity);
            const response = await shopifyFetchClient({
              query: CREATE_CART_MUTATION,
              variables: {
                input: {
                  lines: [{ merchandiseId: variantId, quantity }]
                }
              }
            });

            console.log('Cart creation response:', response);

            if (response.data?.cartCreate?.cart) {
              const cart = response.data.cartCreate.cart;
              const { items, totalQuantity, totalPrice, currencyCode, checkoutUrl } = parseCartData(cart);
              
              set({
                cartId: cart.id,
                items,
                totalQuantity,
                totalPrice,
                currencyCode,
                checkoutUrl,
              });
              console.log('New cart created successfully:', cart.id);
            } else if (response.data?.cartCreate?.userErrors?.length > 0) {
              console.error('Cart creation errors:', response.data.cartCreate.userErrors);
              throw new Error(response.data.cartCreate.userErrors[0].message);
            } else {
              console.error('Unexpected cart creation response:', response);
              throw new Error('Failed to create cart');
            }
          } else {
            // Add to existing cart
            console.log('Adding to existing cart:', state.cartId);
            const response = await shopifyFetchClient({
              query: ADD_TO_CART_MUTATION,
              variables: {
                cartId: state.cartId,
                lines: [{ merchandiseId: variantId, quantity }]
              }
            });

            console.log('Add to cart response:', response);

            if (response.data?.cartLinesAdd?.cart) {
              const cart = response.data.cartLinesAdd.cart;
              const { items, totalQuantity, totalPrice, currencyCode, checkoutUrl } = parseCartData(cart);
              
              set({
                items,
                totalQuantity,
                totalPrice,
                currencyCode,
                checkoutUrl,
              });
              console.log('Item added to existing cart successfully');
            } else if (response.data?.cartLinesAdd?.userErrors?.length > 0) {
              console.error('Add to cart errors:', response.data.cartLinesAdd.userErrors);
              throw new Error(response.data.cartLinesAdd.userErrors[0].message);
            } else {
              console.error('Unexpected add to cart response:', response);
              throw new Error('Failed to add item to cart');
            }
          }
        } catch (error) {
          console.error('Error adding to cart:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      updateCartItem: async (variantId: string, quantity: number) => {
        const state = get();
        if (!state.cartId) return;

        set({ isLoading: true });
        try {
          const lineItem = state.items.find(item => item.variantId === variantId);
          if (!lineItem) return;

          const response = await shopifyFetchClient({
            query: UPDATE_CART_MUTATION,
            variables: {
              cartId: state.cartId,
              lines: [{ id: lineItem.id, quantity }]
            }
          });

          if (response.data?.cartLinesUpdate?.cart) {
            const cart = response.data.cartLinesUpdate.cart;
            const { items, totalQuantity, totalPrice, currencyCode, checkoutUrl } = parseCartData(cart);
            
            set({
              items,
              totalQuantity,
              totalPrice,
              currencyCode,
              checkoutUrl,
            });
          } else if (response.data?.cartLinesUpdate?.userErrors?.length > 0) {
            console.error('Update cart errors:', response.data.cartLinesUpdate.userErrors);
            throw new Error(response.data.cartLinesUpdate.userErrors[0].message);
          }
        } catch (error) {
          console.error('Error updating cart:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      removeFromCart: async (variantId: string) => {
        await get().updateCartItem(variantId, 0);
      },

      refreshCart: async () => {
        const state = get();
        if (!state.cartId) return;

        set({ isLoading: true });
        try {
          const response = await shopifyFetchClient({
            query: GET_CART_QUERY,
            variables: { cartId: state.cartId }
          });

          if (response.data?.cart) {
            const cart = response.data.cart;
            const { items, totalQuantity, totalPrice, currencyCode, checkoutUrl } = parseCartData(cart);
            
            set({
              items,
              totalQuantity,
              totalPrice,
              currencyCode,
              checkoutUrl,
            });
          }
        } catch (error) {
          console.error('Error refreshing cart:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      clearCart: () => set({
        cartId: null,
        items: [],
        totalQuantity: 0,
        totalPrice: 0,
        checkoutUrl: null,
      }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        cartId: state.cartId,
        items: state.items,
        totalQuantity: state.totalQuantity,
        totalPrice: state.totalPrice,
        currencyCode: state.currencyCode,
        checkoutUrl: state.checkoutUrl,
      }),
    }
  )
);