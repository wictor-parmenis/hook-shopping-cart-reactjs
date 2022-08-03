import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import storageAlias from '../config/storageConfig';
import endpoints from '../services/endpoints';
import { Product, Stock } from '../types';
import { saveLocalStorage } from '../util/storageUtils'


interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem(storageAlias.cart)
    if (storagedCart) {
      const parsedStoragedCart = JSON.parse(storagedCart);
      return parsedStoragedCart;
    }

    return [];
  });

  useEffect(() => {
    saveLocalStorage({
      key: storageAlias.cart,
      value: cart
    })
  }, [cart]);


  const addProduct = useCallback(async (productId: number) => {
    try {
      const {data: product}:{data: Product} = await endpoints.getProductById(`${productId}`)
      const {data: productStock}:{data: Stock} = await endpoints.getStockById(`${productId}`)

      if (!productStock) {
        toast.error('Quantidade solicitada fora de estoque');
      }

      else if(productStock.amount === 0) {
        toast.error('Quantidade solicitada fora de estoque');
      }

      const productExist = cart.filter((cart) => cart.id === productId)
      if (productExist && productExist.length > 0) {
        setCart(
          cart.map((item) => {
            return item.id === productId ? { ...item, amount: item.amount + 1 } : item
          })
        )
      } else {
        setCart([...cart, { ...product, amount: 1 }])
      }

    } catch(err) {
      toast.error('Erro na adição do produto');
    }
  }, [cart, setCart]);

  const removeProduct = (productId: number) => {
    try {
      setCart(cart.filter((item) => item.id !== productId))
    } catch {
      toast.error('Erro na remoção do produto');
    }

  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const {data: productStock}:{data: Stock} = await endpoints.getStockById(`${productId}`)

      if (productStock.amount <= 0) {
        throw new Error('Product unavailable')
      }

      if (productStock.amount < amount) {
        toast.error('Quantidade solicitada fora de estoque');
      } else {
        setCart(cart.map((item) => {
          return item.id === productId ? {...item, amount} : item
        }))
      }
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }

  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
