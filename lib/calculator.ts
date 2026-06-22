import { Product } from "@/types/product";

export const calculateQuantity = (m2: number, product: Product) => {
  const areaPerPiece = (product.width * product.height) / 1000000; // m2 ga o'tkazish
  const piecesNeeded = Math.ceil(m2 / areaPerPiece);
  const packagesNeeded = Math.ceil(piecesNeeded / product.inPackage);

  return {
    pieces: piecesNeeded,
    packages: packagesNeeded,
    totalPrice: piecesNeeded * product.pricePerUnit
  };
};