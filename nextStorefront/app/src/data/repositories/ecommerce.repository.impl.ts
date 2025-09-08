import { Product } from '../../domain/entities/product';
import { EcommerceRepository } from '../../domain/repositories/ecommerce.repository';
import { Either, left, right } from '../../shared/utils/either';
import { Provider } from '../providers/provider.factory';

export class EcommerceRepositoryImpl implements EcommerceRepository {
  constructor(private provider: Provider) {}

  async getProducts(): Promise<Either<Error, Product[]>> {
    try {
      const products = await this.provider.fetchProducts();
      return right(products); 
    } catch (error: any) {
      return left(new Error(`Failed to fetch products: ${error.message}`));
    }
  }

 
  async getProductDetail(slug: string): Promise<Either<Error, Product>> {
    try {
        const product = await this.provider.fetchProduct(slug);
        if (!product) {
            return left(new Error("Product not found."));
        }
        return right(product);
    } catch (error: any) {
        return left(new Error(`Failed to fetch product detail: ${error.message}`));
    }
  }

  async addToCart(productId: string, quantity: number): Promise<Either<Error, boolean>> {
    try {
      const success = await this.provider.addToCart(productId, quantity);
      return right(success);
    } catch (error: any) {
      return left(new Error(`Failed to add item to cart: ${error.message}`));
    }
  }

  async placeOrder(): Promise<Either<Error, boolean>> {
    try {
      const success = await this.provider.placeOrder();
      return right(success);
    } catch (error: any) {
      return left(new Error(`Failed to place order: ${error.message}`));
    }
  }
}