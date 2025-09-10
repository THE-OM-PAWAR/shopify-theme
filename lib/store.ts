import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from './types';

interface CartStore {
  cartId: string | null;
  items: CartItem[];
  isOpen: boolean;
  totalQuantity: number;
  totalPrice: number;
  currencyCode: string;
  checkoutUrl: string | null;
  
  // Actions
  setCartId: (cartId: string) => void;
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateItemQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  setCheckoutUrl: (url: string) => void;
}

const calculateTotals = (items: CartItem[]) => {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  return { totalQuantity, totalPrice };
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

      setCartId: (cartId: string) => set({ cartId }),

      addItem: (newItem: CartItem) => set((state) => {
        const existingItem = state.items.find(item => item.variantId === newItem.variantId);
        let updatedItems;
        
        if (existingItem) {
          updatedItems = state.items.map(item =>
            item.variantId === newItem.variantId
              ? { ...item, quantity: Math.min(item.quantity + newItem.quantity, item.maxQuantity) }
              : item
          );
        } else {
          updatedItems = [...state.items, newItem];
        }
        
        const { totalQuantity, totalPrice } = calculateTotals(updatedItems);
        
        return {
          items: updatedItems,
          totalQuantity,
          totalPrice,
          currencyCode: newItem.currencyCode,
        };
      }),

      removeItem: (variantId: string) => set((state) => {
        const updatedItems = state.items.filter(item => item.variantId !== variantId);
        const { totalQuantity, totalPrice } = calculateTotals(updatedItems);
        
        return {
          items: updatedItems,
          totalQuantity,
          totalPrice,
        };
      }),

      updateItemQuantity: (variantId: string, quantity: number) => set((state) => {
        if (quantity <= 0) {
          return get().removeItem(variantId);
        }
        
        const updatedItems = state.items.map(item =>
          item.variantId === variantId
            ? { ...item, quantity: Math.min(quantity, item.maxQuantity) }
            : item
        );
        
        const { totalQuantity, totalPrice } = calculateTotals(updatedItems);
        
        return {
          items: updatedItems,
          totalQuantity,
          totalPrice,
        };
      }),

      clearCart: () => set({
        cartId: null,
        items: [],
        totalQuantity: 0,
        totalPrice: 0,
        checkoutUrl: null,
      }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      setCheckoutUrl: (url: string) => set({ checkoutUrl: url }),
    }),
    {
      name: 'cart-storage',
    }
  )
);