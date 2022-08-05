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


  const addProduct = useCallback(async (productId: number) => {
    try {
      const {data: product}:{data: Product} = await endpoints.getProductById(`${productId}`)
      const {data: productStock}:{data: Stock} = await endpoints.getStockById(`${productId}`)

      if (!productStock) {
        toast.error('Quantidade solicitada fora de estoque');
      }

      else if(productStock.amount <= 1) {
        toast.error('Quantidade solicitada fora de estoque');
      }

      else {
        const productExist = cart.filter((cart) => cart.id === productId)
        let updatedCart: Product[] = [];
        if (productExist && productExist.length > 0) {
          updatedCart =  cart.map((item) => {
            return item.id === productId ? { ...item, amount: item.amount + 1 } : item
          })
        } else {
          updatedCart = ([...cart, { ...product, amount: 1 }])
        }
        setCart(updatedCart);
        saveLocalStorage({
          key: storageAlias.cart,
          value: updatedCart
        })
      }

    } catch(err) {
      toast.error('Erro na adição do produto');
    }
  }, [cart, setCart]);

  const removeProduct = (productId: number) => {
    try {
      const productExists = cart.filter((cart) => cart.id === productId);
      if (productExists.length === 0) {
        throw new Error('Produto não encontrado no carrinho');
      }
      const updatedCart = cart.filter((item) => item.id !== productId);
      setCart(updatedCart)
      saveLocalStorage({
        key: storageAlias.cart,
        value: updatedCart
        })
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
      if (productStock.amount < amount || amount < 1) {
        toast.error('Quantidade solicitada fora de estoque');
      } else {
        const updatedCart = cart.map((item) => {
          return item.id === productId ? {...item, amount} : item
        })
        setCart(updatedCart)
        saveLocalStorage({
         key: storageAlias.cart,
         value: updatedCart
        })
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
