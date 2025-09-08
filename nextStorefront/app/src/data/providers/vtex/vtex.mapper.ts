import { Product as DomainProduct } from '../../../domain/entities/product'; // Importa la entidad de dominio
import { VTEXProductClass } from './vtex.types/vtex.product.types';
import { Product as VtexProduct } from './vtex.types/vtex.products.types'; // Importa las interfaces de VTEX
export const mapVtexProductToDomain = (vtexProduct: VtexProduct): DomainProduct => {
  const images = vtexProduct.items[0]?.images.map(img => img.imageUrl) || [];
  const sellers = vtexProduct.items[0]?.sellers || [];
  const mainSeller = sellers.find(seller => seller.sellerDefault) || sellers[0];
  const commercialOffer = mainSeller?.commertialOffer;

  const price = commercialOffer?.Price || 0;
  const listPrice = commercialOffer?.ListPrice || price;
  const available = (commercialOffer?.AvailableQuantity || 0) > 0;

  return {
    id: vtexProduct.productId,
    name: vtexProduct.productName,
    description: vtexProduct.description,
    images: images,
    price: price,
    listPrice: listPrice,
    available: available,
    slug: vtexProduct.link, 
  };
};

export const mapVtexProductDetailToDomain = (vtexProduct: VTEXProductClass): DomainProduct => {
  

  const productData = vtexProduct;

  const images = productData.items[0]?.images.map(img => img.imageUrl) || [];
  const sellers = productData.items[0]?.sellers || [];
  const mainSeller = sellers.find(seller => seller.sellerDefault) || sellers[0];
  const commercialOffer = mainSeller?.commertialOffer;

  const price = commercialOffer?.Price || 0;
  const listPrice = commercialOffer?.ListPrice || price;
  const available = (commercialOffer?.AvailableQuantity || 0) > 0;

  return {
    id: productData.productId,
    name: productData.productName,
    description: productData.description,
    images: images,
    price: price,
    listPrice: listPrice,
    available: available,
  };
};