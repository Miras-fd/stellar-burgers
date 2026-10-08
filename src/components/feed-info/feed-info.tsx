import { FeedInfoUI } from '@ui';

import { selectFeed } from '@services/slices/feed-slice';
import { useSelector } from '@services/store';

import type { TOrder } from '@utils-types';

const maxOrdersInColumn = 20;

const getOrderNumbersByStatus = (orders: TOrder[], status: string): number[] =>
  orders
    .filter((item) => item.status === status)
    .map((item) => item.number)
    .slice(0, maxOrdersInColumn);

export const FeedInfo = (): React.JSX.Element => {
  const feed = useSelector(selectFeed);

  const readyOrders = getOrderNumbersByStatus(feed.orders, 'done');

  const pendingOrders = getOrderNumbersByStatus(feed.orders, 'pending');

  return (
    <FeedInfoUI readyOrders={readyOrders} pendingOrders={pendingOrders} feed={feed} />
  );
};
