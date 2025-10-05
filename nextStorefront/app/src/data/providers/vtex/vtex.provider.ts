// src/data/providers/vtex.provider.ts

import { AuthRepository } from "@/app/src/domain/repositories/auth.repository";
import { saveVtexAuthCookies } from "@/app/src/shared/utils/auth-storage.util";
import { Product as DomainProduct } from "../../../domain/entities/product";
import { createFetcher } from "../../http/fetcher";
import {
  PRODUCT_DETAIL_QUERY,
  PRODUCT_SEARCH_QUERY,
} from "../queries/queriesVtex";
import {
  mapVtexProductDetailToDomain,
  mapVtexProductToDomain,
} from "./vtex.mapper";
import { VTEXProductClass } from "./vtex.types/vtex.product.types";
import { ProductFetchInput, Products as VtexProducts } from "./vtex.types/vtex.products.types";

// 💡 Definición de la interfaz que necesitamos pasar
interface LoginStoreApi {
  getState: () => {
    logout: () => void;
    revalidateAuth: () => Promise<boolean>;
  };
}

export class VtexProvider implements AuthRepository {
  private readonly apiCall;
  private readonly accountName: string;

  // 💡 MODIFICACIÓN: Aceptamos loginStoreApi como el cuarto parámetro
  constructor(
    storeUrl: string,
    workspace: string,
    authCookies?: string,
    loginStoreApi?: LoginStoreApi
  ) {
    // ... Lógica para extraer el nombre de la cuenta (permanece igual)
    const matches = storeUrl.match(/https?:\/\/([^.]+)\.myvtex\.com/i);
    let fullAccountName = matches ? matches[1] : "";

    const workspaceSeparator = "--";
    if (fullAccountName.includes(workspaceSeparator)) {
      const parts = fullAccountName.split(workspaceSeparator);
      this.accountName = parts[parts.length - 1];
    } else {
      this.accountName = fullAccountName;
    }

    const { fetcher } = createFetcher(
      {
        baseUrl: `${storeUrl}?workspace=${workspace}`,
        provider: "Vtex",
        headers: {
          "Content-Type": "application/json",
        },
        accessToken: "",
      },
      // 💡 CAMBIO CLAVE: Pasamos el loginStoreApi al fetcher
      loginStoreApi
    );

    this.apiCall = fetcher;
  }
  // ... (El resto de la clase permanece igual)

  // fetchProducts, fetchProduct, login, addToCart, placeOrder...
  // (El código de login, fetchProducts, etc. no necesita cambios
  // porque usa this.apiCall, y el manejo del 401 está ahora en el fetcher.)

  async fetchProducts(input: ProductFetchInput = {}): Promise<DomainProduct[]> {
    // ... (Tu implementación de fetchProducts)
    // ...

     const defaultVariables = {
          query: input.query,
          queryFacets: input.query,
          fullText: input.fullText,
          map: input.map,
          selectedFacets: input.selectedFacets || [],
          orderBy: input.orderBy,
          // Rango de precio por defecto (de 0 al máximo, si no se proporciona)
          priceRange: input.priceRange || '0 TO 100000000000', 
          from: input.from,
          to: input.to,
          // Parámetros fijos que VTEX requiere para el comportamiento de e-commerce:
          hideUnavailableItems: true,
          skusFilter: 'ALL_AVAILABLE',
          installmentCriteria: 'MAX_WITHOUT_INTEREST',
          collection: input.collection,
      };
    const response: VtexProducts = await this.apiCall(undefined, {
      method: "POST",
      body: JSON.stringify({
        query: PRODUCT_SEARCH_QUERY,
        variables: defaultVariables,
      }),
    });

    const rawProducts = response.data.productSearch.products;

    return rawProducts.map(mapVtexProductToDomain);
    // ...
  }

  async fetchProduct(slug: string): Promise<DomainProduct | null> {
    // ... (Tu implementación de fetchProduct)
    // ...
    let parsedSlug = slug.startsWith("/") ? slug.substring(1) : slug;

    parsedSlug = parsedSlug.endsWith("/p")
      ? parsedSlug.slice(0, -2)
      : parsedSlug;

    try {
      const response: { data: { product: VTEXProductClass } } =
        await this.apiCall(undefined, {
          method: "POST",
          body: JSON.stringify({
            query: PRODUCT_DETAIL_QUERY,
            variables: { slug: parsedSlug },
          }),
        });

      const rawProduct = response.data.product;

      if (!rawProduct) {
        return null;
      }

      return mapVtexProductDetailToDomain(rawProduct);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch VTEX product: ${error.message}`);
      }
      throw new Error(
        `Failed to fetch VTEX product: An unknown error occurred.`
      );
    }
  }

  async login(email: string, password: string): Promise<string> {
    const ACCOUNT = this.accountName;

    console.log("ACCOUNT", ACCOUNT, email, password);
    if (!ACCOUNT) {
      throw new Error(
        "VTEX Account name could not be determined from store URL."
      );
    }

    const encodeFormBody = (data: Record<string, string>): string => {
      const formBody: string[] = [];
      for (const property in data) {
        const encodedKey = encodeURIComponent(property);
        const encodedValue = encodeURIComponent(data[property]);
        formBody.push(encodedKey + "=" + encodedValue);
      }
      return formBody.join("&");
    };

    // --- PASO 1: Obtener el authenticationToken (Cookie _vss) ---
    const dataAuth = { scope: ACCOUNT };
    const formBodyAuth = encodeFormBody(dataAuth);

    const authUrl = `https://${ACCOUNT}.myvtex.com/api/vtexid/pub/authentication/start`;

    const authenticationTokenResponse = await fetch(authUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body: formBodyAuth,
    });

    if (!authenticationTokenResponse.ok) {
      throw new Error(
        `VTEX Auth Start failed: ${authenticationTokenResponse.status}.`
      );
    }

    const resultAuthenticationToken = await authenticationTokenResponse.json();
    console.log("resultAuthenticationToken", resultAuthenticationToken);
    if (!resultAuthenticationToken?.authenticationToken) {
      throw new Error("VTEX did not return an authentication token in step 1.");
    }

    const vssToken = resultAuthenticationToken.authenticationToken;

    // --- PASO 2: Validar credenciales con el token VSS (Obtener Cookie VtexIdclientAutCookie) ---

    const bodyLogin = {
      login: email,
      password: password,
      recaptcha: "", // Puedes necesitar un valor real
    };

    const formBodyLoginString = encodeFormBody(bodyLogin);

    const validateUrl = `https://${ACCOUNT}.myvtex.com/api/vtexid/pub/authentication/classic/validate`;

    const response = await fetch(validateUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        // Usar el token VSS obtenido en el paso 1 como cookie
        Cookie: `_vss=${vssToken}`,
      },
      body: formBodyLoginString,
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = {
          message: "Unknown authentication error during validation.",
        };
      }
      throw new Error(
        `VTEX Login validation failed: ${
          response.status
        }. Message: ${JSON.stringify(errorData)}`
      );
    }

    const responseJSON = await response.json();
    console.log("responseJSON", responseJSON);
    // El token final de VTEX (VtexIdclientAutCookie)

    if (responseJSON?.authStatus === "WrongCredentials") {
      // 💡 CAMBIO CLAVE: Lanzamos un objeto de error que lleva el estado.
      const error = new Error("VTEX Login Failed: Wrong Credentials.");
      (error as any).authStatus = responseJSON.authStatus; // Adjuntamos la propiedad
      throw error;
    }
    const finalVtexToken = responseJSON?.authCookie?.Value;
    if (!finalVtexToken) {
      throw new Error(
        "Login successful, but final VtexIdclientAutCookie value was not returned."
      );
    }

    // 3. Persistir el token final.
    await saveVtexAuthCookies(finalVtexToken);

    return finalVtexToken;
  }

  async addToCart(productId: string, quantity: number): Promise<boolean> {
    console.log(
      `Adding product ${productId} with quantity ${quantity} to VTEX cart.`
    );
    return true;
  }

  async placeOrder(): Promise<boolean> {
    console.log("Placing order on VTEX.");
    return true;
  }
}
