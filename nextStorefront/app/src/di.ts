import {
  getEcommerceProvider,
  ProviderConfig,
} from "./data/providers/provider.factory";
import { EcommerceRepositoryImpl } from "./data/repositories/ecommerce.repository.impl";
import { GetProductDetailUseCase } from "./domain/use-cases/get-product-detail";
import { GetProductsUseCase } from "./domain/use-cases/get-products.use-case";
import { LoginUseCase } from "./domain/use-cases/login.use-case";


// 💡 Interfaz necesaria para la inyección (la misma que en el fetcher/context)
interface LoginStoreApi {
    getState: () => {
        logout: () => void;
        revalidateAuth: () => Promise<boolean>;
    };
}

// 💡 MODIFICACIÓN: La función ahora acepta loginStoreApi como parámetro
export function initializeServices(config: any, loginStoreApi: LoginStoreApi) {

  const providerConfig = config as ProviderConfig;
 
  // 💡 CAMBIO CLAVE: Pasamos el loginStoreApi al factory
  const ecommerceProvider = getEcommerceProvider(providerConfig, loginStoreApi);
  
  const ecommerceRepository = new EcommerceRepositoryImpl(ecommerceProvider);

  const getProductsUseCase = new GetProductsUseCase(ecommerceRepository);
  const getProductDetailUseCase = new GetProductDetailUseCase(ecommerceRepository);

  const loginUseCase = new LoginUseCase(ecommerceProvider);

  // Devolvemos todas las dependencias en un solo objeto.
  return {
    getProductsUseCase,
    getProductDetailUseCase,
    loginUseCase,
  };
}