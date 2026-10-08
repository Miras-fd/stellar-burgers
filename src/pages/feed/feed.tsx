import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { useEffect } from 'react';

import {
  fetchFeeds,
  selectFeedError,
  selectFeedOrders,
} from '@services/slices/feed-slice';
import { useDispatch, useSelector } from '@services/store';

export const Feed = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const orders = useSelector(selectFeedOrders);
  const feedError = useSelector(selectFeedError);

  useEffect(() => {
    void dispatch(fetchFeeds());
  }, [dispatch]);

  const handleGetFeeds = (): void => {
    void dispatch(fetchFeeds());
  };

  if (feedError && !orders.length) {
    return (
      <p className="text text_type_main-medium mt-10">
        Не удалось загрузить ленту заказов
      </p>
    );
  }

  if (!orders.length) {
    return <Preloader />;
  }

  return <FeedUI orders={orders} handleGetFeeds={handleGetFeeds} />;
};
