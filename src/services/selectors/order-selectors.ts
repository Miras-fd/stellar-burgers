import type { RootState } from '../store';
import type { TOrder } from '@utils-types';

/* Заказ ищется сначала среди уже загруженных (лента, история, последний
   запрошенный по номеру), чтобы не делать лишний запрос к серверу. */
export const selectOrderByNumber = (
  state: RootState,
  orderNumber: number
): TOrder | undefined => {
  const isSameNumber = (order: TOrder): boolean => order.number === orderNumber;

  return (
    state.feed.orders.find(isSameNumber) ??
    state.profileOrders.orders.find(isSameNumber) ??
    (state.order.orderData && isSameNumber(state.order.orderData)
      ? state.order.orderData
      : undefined)
  );
};
