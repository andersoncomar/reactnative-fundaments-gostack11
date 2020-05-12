import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const items = await AsyncStorage.getItem('@marketplace');
      if (items) {
        setProducts(JSON.parse(items));
      }
    }

    loadProducts();
  }, []);

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const incrementedProducts = products.map(product =>
        product.id === id
          ? { ...product, quantity: product.quantity + 1 }
          : product,
      );
      setProducts(incrementedProducts);
      await AsyncStorage.setItem(
        '@marketplace',
        JSON.stringify(incrementedProducts),
      );
    },
    [products],
  );

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART
      const productIndex = products.findIndex(p => p.id === product.id);
      if (productIndex > -1) {
        increment(product.id);
      } else {
        setProducts(state => [...state, { ...product, quantity: 1 }]);
        await AsyncStorage.setItem('@marketplace', JSON.stringify(products));
      }
    },
    [products, increment],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const updatedProducts = products.map(product =>
        product.id === id
          ? { ...product, quantity: product.quantity - 1 }
          : product,
      );
      setProducts(updatedProducts);
      await AsyncStorage.setItem(
        '@marketplace',
        JSON.stringify(updatedProducts),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
