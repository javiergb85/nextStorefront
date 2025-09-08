import {
    getEcommerceProvider,
    ProviderConfig,
} from "./data/providers/provider.factory";
import { EcommerceRepositoryImpl } from "./data/repositories/ecommerce.repository.impl";
import { GetProductDetailUseCase } from "./domain/use-cases/get-product-detail";
import { GetProductsUseCase } from "./domain/use-cases/get-products.use-case";
import { LoginUseCase } from "./domain/use-cases/login.use-case";
import config from "./providers.json";

// Carga la configuración del archivo JSON
const providerConfig = config as ProviderConfig;

// 1. Obtiene la instancia del proveedor a través de la fábrica
const ecommerceProvider = getEcommerceProvider(providerConfig);

// 2. Inicia el repositorio con el proveedor elegido
const ecommerceRepository = new EcommerceRepositoryImpl(ecommerceProvider);

// 3. Inicia el caso de uso con el repositorio
export const getProductsUseCase = new GetProductsUseCase(ecommerceRepository);
export const getProductDetailUseCase = new GetProductDetailUseCase(
  ecommerceRepository
);

// 4. El caso de uso de login también usa el mismo proveedor,
// sin saber si es Shopify, VTEX o cualquier otro.
export const loginUseCase = new LoginUseCase(ecommerceProvider);
