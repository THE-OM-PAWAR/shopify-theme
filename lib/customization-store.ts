'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CustomizationData {
  originalImageUrl: string;
  renderedImageUrl: string;
  frameImageUrl: string;
  imageState: {
    x: number;
    y: number;
    scale: number;
    rotation: number;
  };
  createdAt: string;
}

interface CustomizationStore {
  customizations: Record<string, CustomizationData>;
  saveCustomization: (productId: string, data: CustomizationData) => void;
  getCustomization: (productId: string) => CustomizationData | null;
  removeCustomization: (productId: string) => void;
  clearAllCustomizations: () => void;
}

export const useCustomizationStore = create<CustomizationStore>()(
  persist(
    (set, get) => ({
      customizations: {},

      saveCustomization: (productId: string, data: CustomizationData) => {
        console.log('Saving customization for product:', productId, data);
        set((state) => ({
          customizations: {
            ...state.customizations,
            [productId]: data,
          },
        }));
      },

      getCustomization: (productId: string) => {
        const customization = get().customizations[productId] || null;
        console.log('Getting customization for product:', productId, customization);
        return customization;
      },

      removeCustomization: (productId: string) => {
        set((state) => {
          const newCustomizations = { ...state.customizations };
          delete newCustomizations[productId];
          return { customizations: newCustomizations };
        });
      },

      clearAllCustomizations: () => {
        set({ customizations: {} });
      },
    }),
    {
      name: 'product-customizations',
      partialize: (state) => ({ customizations: state.customizations }),
    }
  )
);