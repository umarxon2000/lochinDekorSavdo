import { Product } from "@/types/product";

export const calculateQuantity = (m2: number, product: Product) => {
  const areaPerPiece = (product.width * product.thickness) / 1000000; // m2 ga o'tkazish
  const piecesNeeded = Math.ceil(m2 / areaPerPiece);
  const packagesNeeded = Math.ceil(piecesNeeded / product.in_package);

  return {
    pieces: piecesNeeded,
    packages: packagesNeeded,
    totalPrice: piecesNeeded * product.price_per_unit
  };
};