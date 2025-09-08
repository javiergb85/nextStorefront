import { Either } from '../../shared/utils/either';
import { Product } from '../entities/product';

export interface EcommerceRepository {
  getProducts(): Promise<Either<Error, Product[]>>;
  getProductDetail(productId: string): Promise<Either<Error, Product>>; 
  addToCart(productId: string, quantity: number): Promise<Either<Error, boolean>>;
  placeOrder(): Promise<Either<Error, boolean>>; 
}