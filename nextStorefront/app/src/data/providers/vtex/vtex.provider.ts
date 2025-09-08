// src/data/providers/vtex.provider.ts

import { AuthRepository } from "@/app/src/domain/repositories/auth.repository";
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
import { Products as VtexProducts } from "./vtex.types/vtex.products.types";

export class VtexProvider implements AuthRepository {
  private readonly apiCall;
  // Recibe toda la configuración a través del constructor
  constructor(storeUrl: string, workspace: string, authCookies?: string) {
    // this.apiCall = fetcher({
    //   baseUrl: `${storeUrl}?workspace=${workspace}`,
    //   headers: {
    //     "Content-Type": "application/json",
    //     // Pasa las cookies si existen, de lo contrario, deja un objeto vacío
    //     ...(authCookies && { Cookie: authCookies }),
    //   },
    // });

    const { fetcher } = createFetcher({
      baseUrl: `${storeUrl}?workspace=${workspace}`,
      provider: "Vtex",
      headers: {
        "Content-Type": "application/json",
      },
      accessToken: ""
    });

    this.apiCall = fetcher;
  }

  async fetchProducts(): Promise<DomainProduct[]> {
    try {
      // Combina la URL base con el workspace para la petición
      // const url = `${this.storeUrl}?workspace=${this.workspace}`;

      // // Realiza la llamada a la API de VTEX
      // const response = await fetch(url, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     Cookie: this.authCookies || '',
      //   },
      //   body: JSON.stringify({
      //     query: PRODUCT_SEARCH_QUERY, // <-- Usa la consulta importada
      //     variables: {
      //       // ... (variables para la consulta si son necesarias)
      //     },
      //   }),
      // });

      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(
      //     `HTTP error! Status: ${response.status}. Message: ${JSON.stringify(
      //       errorData
      //     )}`
      //   );
      // }

      //const rawData: VtexProducts = await response.json();
      //const rawProducts = rawData.data.productSearch.products;
      const response: VtexProducts = await this.apiCall(undefined, {
        method: "POST",
        body: JSON.stringify({
          query: PRODUCT_SEARCH_QUERY,
          variables: {
            // Puedes pasar variables aquí si las necesitas
          },
        }),
      });

      // El manejo de errores de `response.ok` ya lo hace el `fetcher`,
      // así que no necesitas revisarlo de nuevo aquí.
      const rawProducts = response.data.productSearch.products;

      // Mapea y normaliza los productos
      return rawProducts.map(mapVtexProductToDomain);
      // Mapea y normaliza los productos
      // return rawProducts.map(mapVtexProductToDomain);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch VTEX products: ${error.message}`);
      }

      throw new Error(
        `Failed to fetch VTEX products: An unknown error occurred.`
      );
    }
  }

  async fetchProduct(slug: string): Promise<DomainProduct | null> {
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
    return "";
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
