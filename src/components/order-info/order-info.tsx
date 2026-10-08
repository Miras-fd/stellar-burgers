import { Preloader, OrderInfoUI } from '@ui';
import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { selectOrderByNumber } from '@services/selectors/order-selectors';
import { selectIngredients } from '@services/slices/ingredients-slice';
import { fetchOrderByNumber } from '@services/slices/order-slice';
import { useDispatch, useSelector } from '@services/store';

import type { TIngredient } from '@utils-types';

type TIngredientsWithCount = Record<string, TIngredient & { count: number }>;

export const OrderInfo = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const { number } = useParams();
  const orderNumber = Number(number);

  const orderData = useSelector((state) => selectOrderByNumber(state, orderNumber));
  const ingredients = useSelector(selectIngredients);

  /* При прямом переходе по ссылке заказа может не быть в сторе —
     тогда запрашиваем его с сервера по номеру. */
  useEffect(() => {
    if (!orderData && orderNumber) {
      void dispatch(fetchOrderByNumber(orderNumber));
    }
  }, [dispatch, orderData, orderNumber]);

  /* Готовим данные для отображения */
  const orderInfo = useMemo(() => {
    if (!orderData || !ingredients.length) return null;

    const date = new Date(orderData.createdAt);

    const ingredientsInfo = orderData.ingredients.reduce(
      (acc: TIngredientsWithCount, item) => {
        if (!acc[item]) {
          const ingredient = ingredients.find((ing) => ing._id === item);
          if (ingredient) {
            acc[item] = {
              ...ingredient,
              count: 1,
            };
          }
        } else {
          acc[item].count++;
        }

        return acc;
      },
      {}
    );

    const total = Object.values(ingredientsInfo).reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );

    return {
      ...orderData,
      ingredientsInfo,
      date,
      total,
    };
  }, [orderData, ingredients]);

  if (!orderInfo) {
    return <Preloader />;
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};
