import React, { createContext, ReactNode, useContext, useMemo } from 'react';
import { initializeServices } from '../di'; // ✨ Importa la nueva función de inicialización.

// Define la interfaz para el contenedor de inyección de dependencias.
// ✨ Ya no necesitas importar cada caso de uso individualmente.
interface Services {
  getProductsUseCase: ReturnType<typeof initializeServices>['getProductsUseCase'];
  getProductDetailUseCase: ReturnType<typeof initializeServices>['getProductDetailUseCase'];
  loginUseCase: ReturnType<typeof initializeServices>['loginUseCase'];
}

const StorefrontContext = createContext<Services | undefined>(undefined);

interface StorefrontProviderProps {
  children: ReactNode;
  config: any; // El tipo de config depende de tu providers.json
}

export const StorefrontProvider: React.FC<StorefrontProviderProps> = ({ children, config }) => {
  // ✨ Usamos useMemo para inicializar los servicios solo una vez
  // y para asegurarnos de que se use el 'config' pasado como prop.
  const services = useMemo(() => {
    return initializeServices(config);
  }, [config]); // La dependencia es 'config' para que se re-inicialice si cambia.

  return (
    <StorefrontContext.Provider value={services}>
      {children}
    </StorefrontContext.Provider>
  );
};

// Hook personalizado para usar los servicios fácilmente en cualquier componente
export const useStorefront = () => {
  const context = useContext(StorefrontContext);
  if (!context) {
    throw new Error('useStorefront must be used within a StorefrontProvider');
  }
  return context;
};
