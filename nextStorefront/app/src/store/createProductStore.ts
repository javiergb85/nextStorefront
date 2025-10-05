import { create } from 'zustand';
import { Product } from '../domain/entities/product';
import { GetProductsUseCase } from '../domain/use-cases/get-products.use-case';

interface ProductState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
}

// ✨ Creamos una función "fábrica" que devuelve el store, aceptando los casos de uso como argumentos.
export const createProductStore = (getProductsUseCase: GetProductsUseCase) => {
  return create<ProductState>((set) => ({
    products: [],
    isLoading: false,
    error: null,
  
    fetchProducts: async () => {
      set({ isLoading: true, error: null });

      const result = await getProductsUseCase.execute();
      
      result.fold(
        (err) => {
          // En caso de error, actualiza el estado de error
          set({
            products: [],
            isLoading: false,
            error: `Failed to load products: ${err.message}`,
          });
        },
        (data) => {
          // En caso de éxito, actualiza el estado de los productos
          set({
            products: data,
            isLoading: false,
            error: null,
          });
        }
      );
    },
  }));
};
