import { BurgerConstructorUI } from '@ui';
import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { selectConstructorItems } from '@services/slices/constructor-slice';
import {
  clearOrderModalData,
  createOrder,
  selectOrderModalData,
  selectOrderRequest,
} from '@services/slices/order-slice';
import { selectUser } from '@services/slices/user-slice';
import { useDispatch, useSelector } from '@services/store';

import type { TConstructorIngredient } from '@utils-types';

const loginPath = '/login';
const bunsInBurger = 2;

export const BurgerConstructor = (): React.JSX.Element | null => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const constructorItems = useSelector(selectConstructorItems);
  const orderRequest = useSelector(selectOrderRequest);
  const orderModalData = useSelector(selectOrderModalData);
  const user = useSelector(selectUser);

  const onOrderClick = (): void => {
    if (!user) {
      void navigate(loginPath, { state: { from: location } });
      return;
    }

    if (!constructorItems.bun || orderRequest) return;

    const { bun, ingredients } = constructorItems;
    const ingredientIds = [
      bun._id,
      ...ingredients.map((ingredient) => ingredient._id),
      bun._id,
    ];

    void dispatch(createOrder(ingredientIds));
  };

  const closeOrderModal = (): void => {
    dispatch(clearOrderModalData());
  };

  const price = useMemo(
    () =>
      (constructorItems.bun ? constructorItems.bun.price * bunsInBurger : 0) +
      constructorItems.ingredients.reduce(
        (sum: number, ingredient: TConstructorIngredient) => sum + ingredient.price,
        0
      ),
    [constructorItems]
  );

  return (
    <BurgerConstructorUI
      price={price}
      orderRequest={orderRequest}
      constructorItems={constructorItems}
      orderModalData={orderModalData}
      onOrderClick={onOrderClick}
      closeOrderModal={closeOrderModal}
    />
  );
};
