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
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const product_list = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );

      if (product_list) {
        setProducts([...JSON.parse(product_list)]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const ProductInCart = products.find(p => p.id === product.id);

      if (ProductInCart) {
        setProducts(
          products.map(p =>
            p.id === product.id ? { ...product, quantity: p.quantity + 1 } : p,
          ),
        );
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const NewProducts = products.map(p =>
        p.id === id ? { ...p, quantity: p.quantity + 1 } : { ...p },
      );
      setProducts([...NewProducts]);
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(NewProducts),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const NewProducts = products.map(p =>
        p.id === id ? { ...p, quantity: p.quantity - 1 } : { ...p },
      );
      const nonZeros = NewProducts.filter(p => p.quantity > 0);
      setProducts([...nonZeros]);
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(nonZeros),
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
