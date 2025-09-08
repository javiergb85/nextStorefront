// src/app/ProductListScreen.tsx

import { Link } from 'expo-router'; // 👈 Importa Link de expo-router
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Product as DomainProduct } from '../../domain/entities/product';
import { useOrderFormStore } from '../../store/order-form.store';
import { useProductStore } from '../../store/product.store';

const { width } = Dimensions.get('window');
const itemWidth = (width - 48) / 2;

const QuantitySelector = ({
  quantity,
  onDecrease,
  onIncrease,
}: {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
}) => (
  <View style={styles.quantitySelectorContainer}>
    <TouchableOpacity onPress={onDecrease} style={styles.quantityButton}>
      <Text style={styles.quantityButtonText}>-</Text>
    </TouchableOpacity>
    <Text style={styles.quantityText}>{quantity}</Text>
    <TouchableOpacity onPress={onIncrease} style={styles.quantityButton}>
      <Text style={styles.quantityButtonText}>+</Text>
    </TouchableOpacity>
  </View>
);

// Pasa navigation a ProductCard para que pueda navegar
const ProductCard = ({ product }: { product: DomainProduct }) => {
  const { items, addItem, updateItemQuantity, removeItem } = useOrderFormStore();
  const cartItem = items.find((item) => item.id === product.id);

  const handleIncrease = () => {
    if (cartItem) {
      updateItemQuantity(product.id, cartItem.quantity + 1);
    }
  };

  const handleDecrease = () => {
    if (cartItem && cartItem.quantity > 1) {
      updateItemQuantity(product.id, cartItem.quantity - 1);
    } else {
      removeItem(product.id);
    }
  };

  const handleAddToCart = () => {
    addItem(product.id, 1);
  };

 
  return (
    // 👈 Usa el componente Link para navegar a la PDP
    // La ruta debe ser la que definas para la PDP, por ejemplo: [slug].tsx
     <Link href={{ pathname: '/[slug]', params: { slug: encodeURIComponent(product?.slug || '') || product?.slug } }} asChild>
      <TouchableOpacity
        style={styles.card}
      >
        <Image
          source={{ uri: product.images[0] }}
          style={styles.productImage}
          resizeMode="contain"
        />
        <View style={styles.textContainer}>
          <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
          <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
          {cartItem ? (
            <QuantitySelector
              quantity={cartItem.quantity}
              onIncrease={handleIncrease}
              onDecrease={handleDecrease}
            />
          ) : (
            <TouchableOpacity
              style={styles.addToCartButton}
              onPress={handleAddToCart}
            >
              <Text style={styles.addToCartButtonText}>Añadir al carrito</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Link>
  );
};

const ProductListScreen = () => {
  const insets = useSafeAreaInsets();
  const { products, isLoading, error, fetchProducts } = useProductStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Cargando productos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          ❌ ¡Ocurrió un error!
          {'\n'}
          {error}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.safeAreaContainer,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.container}>
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProductCard product={item} />}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 16,
  },
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 8,
    overflow: 'hidden',
    width: itemWidth,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImage: {
    width: '100%',
    height: 150,
  },
  textContainer: {
    padding: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    minHeight: 40,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 5,
  },
  addToCartButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  addToCartButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  quantitySelectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  quantityButton: {
    backgroundColor: '#ddd',
    padding: 8,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  list: {
    paddingVertical: 16,
  },
});

export default ProductListScreen;