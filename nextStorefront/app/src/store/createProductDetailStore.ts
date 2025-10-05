import { create } from 'zustand';
import { Product } from '../domain/entities/product';
import { GetProductDetailUseCase } from '../domain/use-cases/get-product-detail';

interface ProductDetailState {
  product: Product | null;
  isLoading: boolean;
  error: string | null;
  fetchProductDetail: (productId: string) => Promise<void>;
  clearProductDetail: () => void;
}

// ✨ Creamos una función "fábrica" que devuelve el store, aceptando el caso de uso como argumento.
export const createProductDetailStore = (getProductDetailUseCase: GetProductDetailUseCase) => {
  return create<ProductDetailState>((set) => ({
    product: null,
    isLoading: false,
    error: null,
    
    fetchProductDetail: async (productId: string) => {
      set({ isLoading: true, error: null });

      // Ahora usamos el caso de uso inyectado, no el importado directamente.
      const result = await getProductDetailUseCase.execute(productId);
    
      result.fold(
        (err) => {
          console.log(err)
          set({
            product: null,
            isLoading: false,
            error: `Failed to load product detail: ${err.message}`,
          });
        },
        (data) => {
          console.log(data)
          set({
            product: data,
            isLoading: false,
            error: null,
          });
        }
      );
    },
    
    clearProductDetail: () => {
      set({ product: null, isLoading: false, error: null });
    },
  }));
};