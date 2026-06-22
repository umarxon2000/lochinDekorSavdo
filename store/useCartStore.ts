"use client"
import { create } from "zustand";

// 1. Mahsulot modeli
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

// 2. Sotuvchi modeli
export interface Seller {
  id: string;
  name: string;
  phone?: string | null;
}

// 3. Zustand do'koni uchun interfeys (Strict Types)
interface CartState {
  items: CartItem[];
  customerName: string;
  customerPhone: string;
  selectedSeller: Seller | null; // Tanlangan sotuvchi obyekti
  
  addItem: (item: CartItem) => void;
  removeItem: (cartItemId: string) => void;
  clearCart: () => void;
  setCustomerInfo: (name: string, phone: string) => void;
  setSelectedSeller: (seller: Seller | null) => void; // Sotuvchini o'rnatish funksiyasi
}

export const useCartStore = create<CartState>((set) => ({
  // Boshlang'ich holat (Initial State)
  items: [],
  customerName: "",
  customerPhone: "",
  selectedSeller: null,

  // Mahsulot qo'shish (Agar oldindan bo'lsa, o'chirib yangisini yozadi)
  addItem: (item: CartItem) =>
    set((state) => {
      const filtered = state.items.filter((i) => i.cartItemId !== item.cartItemId);
      return { items: [...filtered, item] };
    }),

  // Mahsulotni savatdan o'chirish
  removeItem: (cartItemId: string) =>
    set((state) => ({
      items: state.items.filter((i) => i.cartItemId !== cartItemId),
    })),

  // Mijoz ma'lumotlarini saqlash
  setCustomerInfo: (name: string, phone: string) => 
    set({ customerName: name, customerPhone: phone }),

  // Sotuvchi ma'lumotlarini saqlash
  setSelectedSeller: (seller: Seller | null) => 
    set({ selectedSeller: seller }),

  // Savatni butunlay bo'shatish va ma'lumotlarni tozalash
  clearCart: () => set({ 
    items: [], 
    customerName: "", 
    customerPhone: "",
    selectedSeller: null // Sotuvchi ham tozalanadi
  }),
}));