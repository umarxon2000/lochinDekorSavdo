"use client"
import { create } from "zustand";

export interface CartItem {
  cartItemId: string;       // product_id + variant_id kombinatsiyasi
  id: string;               // Mahsulot ID raqami
  variantId?: string;       // Tanlangan variant ID raqami
  name: string;             // Mahsulot nomi (Variant xususiyatlari bilan birga)
  price_per_unit: number;   // Birlik uchun narx
  unit_type: "metr" | "m2" | "dona"; // O‘lchov birligi
  input_value: number;      // Sotuvchi kiritgan miqdor
  calculated_pieces: number;// Hisoblangan dona soni
  total_price: number;      // Umumiy tushum summasi
  width: number;
  length: number;
  thickness: number;
  category: string;
}

interface CartState {
  items: CartItem[];
  customerName: string;
  customerPhone: string;
  sellerId: string;
  sellerName: string;
  
  addItem: (item: CartItem) => void;
  removeItem: (cartItemId: string) => void;
  clearCart: () => void;
  setCustomerInfo: (name: string, phone: string) => void;
  setSellerInfo: (id: string, name: string) => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  customerName: "",
  customerPhone: "",
  sellerId: "",
  sellerName: "",

  addItem: (item) =>
    set((state) => {
      const filtered = state.items.filter((i) => i.cartItemId !== item.cartItemId);
      return { items: [...filtered, item] };
    }),

  removeItem: (cartItemId) =>
    set((state) => ({
      items: state.items.filter((i) => i.cartItemId !== cartItemId),
    })),

  setCustomerInfo: (name, phone) => 
    set({ customerName: name, customerPhone: phone }),

  setSellerInfo: (id, name) => 
    set({ sellerId: id, sellerName: name }),

  clearCart: () => set({ 
    items: [], 
    customerName: "", 
    customerPhone: "" 
  }),
}));