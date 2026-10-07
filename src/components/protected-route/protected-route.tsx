import { Preloader } from '@ui';
import { Navigate, useLocation } from 'react-router-dom';

import { selectIsAuthChecked, selectUser } from '@services/slices/user-slice';
import { useSelector } from '@services/store';

import type { ProtectedRouteProps, ProtectedRouteState } from './type';

const loginPath = '/login';
const homePath = '/';

export const ProtectedRoute = ({
  onlyUnAuth = false,
  children,
}: ProtectedRouteProps): React.JSX.Element => {
  const location = useLocation();
  const isAuthChecked = useSelector(selectIsAuthChecked);
  const user = useSelector(selectUser);

  if (!isAuthChecked) {
    return <Preloader />;
  }

  /* Неавторизованного пользователя отправляем на вход, запомнив, куда он шёл. */
  if (!onlyUnAuth && !user) {
    return <Navigate to={loginPath} replace state={{ from: location }} />;
  }

  /* Авторизованного пользователя уводим со страниц входа и регистрации:
     туда, куда он пытался попасть, или на главную. */
  if (onlyUnAuth && user) {
    const locationState = location.state as ProtectedRouteState | null;
    const redirectLocation = locationState?.from ?? { pathname: homePath };

    return <Navigate to={redirectLocation} replace />;
  }

  return children;
};
