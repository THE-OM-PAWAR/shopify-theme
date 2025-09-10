'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, CustomFrame } from '@/types/shopify';

interface CartStore {
  items: CartItem[];
  customFrames: CustomFrame[];
  isOpen: boolean;
  totalItems: number;
  totalPrice: number;
  
  // Cart actions
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  
  // Custom frame actions
  addCustomFrame: (frame: CustomFrame) => void;
  removeCustomFrame: (id: string) => void;
  getCustomFramesByOrder: (orderId: string) => CustomFrame[];
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      customFrames: [],
      isOpen: false,
      totalItems: 0,
      totalPrice: 0,

      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find((i) => 
            i.variantId === item.variantId && !item.customImage
          );

          let newItems;
          if (existingItem && !item.customImage) {
            newItems = state.items.map((i) =>
              i.variantId === item.variantId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            );
          } else {
            newItems = [...state.items, { ...item, id: `${item.variantId}-${Date.now()}` }];
          }

          const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
          const totalPrice = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

          return {
            items: newItems,
            totalItems,
            totalPrice,
          };
        });
      },

      removeItem: (id) => {
        set((state) => {
          const newItems = state.items.filter((item) => item.id !== id);
          const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
          const totalPrice = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

          return {
            items: newItems,
            totalItems,
            totalPrice,
          };
        });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }

        set((state) => {
          const newItems = state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          );

          const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
          const totalPrice = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

          return {
            items: newItems,
            totalItems,
            totalPrice,
          };
        });
      },

      clearCart: () => {
        set({
          items: [],
          totalItems: 0,
          totalPrice: 0,
        });
      },

      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },

      addCustomFrame: (frame) => {
        set((state) => ({
          customFrames: [...state.customFrames, frame],
        }));
      },

      removeCustomFrame: (id) => {
        set((state) => ({
          customFrames: state.customFrames.filter((frame) => frame.id !== id),
        }));
      },

      getCustomFramesByOrder: (orderId) => {
        return get().customFrames.filter((frame) => frame.orderId === orderId);
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
        customFrames: state.customFrames,
      }),
    }
  )
);