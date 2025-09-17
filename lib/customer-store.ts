'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ShopifyCustomer } from './shopify-customer';

interface CustomerStore {
  customer: ShopifyCustomer | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  
  // Actions
  setCustomer: (customer: ShopifyCustomer, accessToken: string) => void;
  clearCustomer: () => void;
  updateCustomer: (updates: Partial<ShopifyCustomer>) => void;
}

export const useCustomerStore = create<CustomerStore>()(
  persist(
    (set, get) => ({
      customer: null,
      accessToken: null,
      isAuthenticated: false,
      _hasHydrated: false,

      setCustomer: (customer: ShopifyCustomer, accessToken: string) => {
        set({
          customer,
          accessToken,
          isAuthenticated: true,
        });
      },

      clearCustomer: () => {
        set({
          customer: null,
          accessToken: null,
          isAuthenticated: false,
        });
      },

      updateCustomer: (updates: Partial<ShopifyCustomer>) => {
        const currentCustomer = get().customer;
        if (currentCustomer) {
          set({
            customer: { ...currentCustomer, ...updates },
          });
        }
      },
    }),
    {
      name: 'customer-storage',
      partialize: (state) => ({
        customer: state.customer,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hasHydrated = true;
        }
      },
    }
  )
);