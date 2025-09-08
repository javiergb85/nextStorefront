import { getAuthToken } from "../../shared/utils/auth-storage.util";

interface FetcherConfig {
  baseUrl: string;
  provider: "Shopify" | "Vtex";
  headers?: Record<string, string>;
  accessToken: string;
}

export const createFetcher = (config: FetcherConfig) => {
  const fetcher = async (path?: string, options?: RequestInit) => {
   
    const url = path ? `${config.baseUrl}${path}` : config.baseUrl;
    const allHeaders = new Headers(config.headers);

    if (options?.headers) {
      for (const [key, value] of Object.entries(options.headers)) {
        allHeaders.set(key, value);
      }
    }

    const authToken = await getAuthToken();

    // Ahora, el fetcher valida el proveedor antes de añadir el encabezado de autenticación.

    if (config.provider === "Shopify") {
      allHeaders.set("X-Shopify-Storefront-Access-Token", config?.accessToken);
    }
    if (authToken) {
      if (config.provider === "Shopify") {
        allHeaders.set("Authorization", `Bearer ${authToken}`);
      } else if (config.provider === "Vtex") {
        allHeaders.set("VtexIdclientAutCookie", authToken);
      } else {
        // En caso de que se necesite, puedes agregar un encabezado genérico de autorización
        allHeaders.set("Authorization", `Bearer ${authToken}`);
      }
    }

    const response = await fetch(url, {
      ...options,
      headers: allHeaders,
    });
    // console.log("fetcher token, ", url, {
    //       ...options,
    //       headers: allHeaders,
    //     })

    console.log("response.ok ",response)

 
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: "Unknown error, could not parse JSON." };
      }
      throw new Error(
        `API error! Status: ${response.status}. Message: ${JSON.stringify(
          errorData
        )}`
      );
    }

    return response.json();
  };

  return { fetcher };
};
