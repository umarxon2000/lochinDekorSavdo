export interface ProductVariant {
  id: string;
  product_id: string;
  color?: string;         // Rangi
  series?: string;        // Seriya raqami
  factory?: string;       // Ishlab chiqaruvchi zavod
  price?: number;         // Variantning maxsus narxi (agar bo‘lsa)
  stock_quantity: number; // Shu variantning ombordagi qoldig‘i
}

export interface Product {
  id: string;
  name: string;
  category: 'yogoch' | 'dekor' | 'karniz'; // Kategoriya turlari
  unit_type: 'metr' | 'm2' | 'dona';      // O‘lchov birliklari
  length: number;                         // Uzunligi (mm)
  width: number;                          // Kengligi (mm)
  thickness: number;                      // Qalinligi (mm)
  in_package: number;                     // Qadoqdagi (pachkadagi) soni
  price_per_unit: number;                 // Asosiy narxi
  stock_quantity: number;                 // Umumiy ombordagi qoldiq
  variants?: ProductVariant[];            // Mahsulot variantlari massivi
  created_at: string;
}