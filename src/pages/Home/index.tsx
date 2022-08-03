import React, { useState, useEffect, useCallback } from 'react';
import { MdAddShoppingCart } from 'react-icons/md';

import { ProductList } from './styles';
import { api } from '../../services/api';
import { formatPrice } from '../../util/formatUtils';
import { useCart } from '../../hooks/useCart';
import endpoints from '../../services/endpoints';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
}

interface ProductFormatted extends Product {
  priceFormatted: string;
}

interface CartItemsAmount {
  [key: number]: number;
}

const Home = (): JSX.Element => {
  const [products, setProducts] = useState<ProductFormatted[]>([]);
  const { addProduct, cart } = useCart();

  const cartItemsAmount = cart.reduce((sumAmount, product) => {
    sumAmount[product.id] ? sumAmount[product.id] += product.amount : sumAmount[product.id] = product.amount;
    return sumAmount;
  }, {} as CartItemsAmount)

  useEffect(() => {
    async function loadProducts() {
      const response = await endpoints.getProducts();
      const products = response.data.map((product: Product) => ({
        ...product,
        priceFormatted: formatPrice(product.price)
      }));
      setProducts(products);
    }

    loadProducts();
  }, []);

  const handleAddProduct = useCallback(async (productId: number) => {
    await addProduct(productId);
   }, [addProduct]);

  return (
    <ProductList>
      {
        products && products.map((product) => (
          <li key={product.id}>
            <img src={product.image} alt="Tênis de Caminhada Leve Confortável" />
            <strong>{product.title}</strong>
            <span>{product.priceFormatted}</span>
            <button
              type="button"
              data-testid="add-product-button"
              onClick={() => handleAddProduct(product.id)}
            >
              <div data-testid="cart-product-quantity">
                <MdAddShoppingCart size={16} color="#FFF" />
                {cartItemsAmount[product.id] || 0}
              </div>

              <span>ADICIONAR AO CARRINHO</span>
            </button>
          </li>
        ))
      }
    </ProductList>
  );
};

export default Home;
