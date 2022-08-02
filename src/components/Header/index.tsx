import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdShoppingBasket } from 'react-icons/md';

import logo from '../../assets/images/logo.svg';
import { Container, Cart } from './styles';
import { useCart } from '../../hooks/useCart';

const Header = (): JSX.Element => {
  const { cart } = useCart();
  const [quantityProducts, setQuantityProducts] = useState(0);

  useEffect(() => {
    const allIdsProducts = cart.map((product) => product.id);
    const allUniqueIds = [...new Set(allIdsProducts)];
    setQuantityProducts(allUniqueIds.length);
  }, [cart])

  return (
    <Container>
      <Link to="/">
        <img src={logo} alt="Rocketshoes" />
      </Link>

      <Cart to="/cart">
        <div>
          <strong>Meu carrinho</strong>
          <span data-testid="cart-size">
            {quantityProducts === 1 ? `${quantityProducts} item` : `${quantityProducts} itens`}
          </span>
        </div>
        <MdShoppingBasket size={36} color="#FFF" />
      </Cart>
    </Container>
  );
};

export default Header;
