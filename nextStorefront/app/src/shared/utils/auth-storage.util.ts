// src/shared/utils/auth-storage.util.ts

import * as SecureStore from 'expo-secure-store';

const SHOPIFY_TOKEN_KEY = 'shopifyAccessToken';
const VTEX_COOKIES_KEY = 'vtexAuthCookies';

// Esta función es el nuevo punto de entrada para obtener un token de autenticación
export const getAuthToken = async (): Promise<string | null> => {
  try {
    const shopifyToken = await SecureStore.getItemAsync(SHOPIFY_TOKEN_KEY);
    if (shopifyToken) {
      return shopifyToken;
    }
    
    const vtexCookies = await SecureStore.getItemAsync(VTEX_COOKIES_KEY);
    if (vtexCookies) {
      return vtexCookies;
    }
    
    return null; // Devuelve null si no se encuentra ningún token
  } catch (e) {
    console.error('Failed to get token from SecureStore.', e);
    return null;
  }
};

// Puedes mantener las funciones específicas para guardar, ya que el caso de uso
// de login de cada proveedor es responsable de guardarlo.
export const saveShopifyAccessToken = async (token: string | null) => {
  if (token) {
    await SecureStore.setItemAsync(SHOPIFY_TOKEN_KEY, token);
  } else {
    await SecureStore.deleteItemAsync(SHOPIFY_TOKEN_KEY);
  }
};

export const saveVtexAuthCookies = async (cookies: string | null) => {
  if (cookies) {
    await SecureStore.setItemAsync(VTEX_COOKIES_KEY, cookies);
  } else {
    await SecureStore.deleteItemAsync(VTEX_COOKIES_KEY);
  }
};