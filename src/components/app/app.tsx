import {
  AppHeader,
  IngredientDetails,
  Modal,
  OrderInfo,
  ProtectedRoute,
} from '@components';
import {
  ConstructorPage,
  Feed,
  ForgotPassword,
  Login,
  NotFound404,
  Profile,
  ProfileOrders,
  Register,
  ResetPassword,
} from '@pages';
import { Preloader } from '@ui';
import clsx from 'clsx';
import { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, useParams } from 'react-router-dom';

import {
  fetchIngredients,
  selectIngredients,
  selectIngredientsError,
  selectIngredientsLoading,
} from '@services/slices/ingredients-slice';
import { checkUserAuth } from '@services/slices/user-slice';
import { useDispatch, useSelector } from '@services/store';

import type { AppContentProps, LocationState, ModalRouteProps } from './type';

import '../../index.css';

import styles from './app.module.css';

const orderNumberLength = 6;

const formatOrderNumber = (number: string): string =>
  `#${number.padStart(orderNumberLength, '0')}`;

const IngredientPage = (): React.JSX.Element => (
  <div className={styles.detailPageWrap}>
    <h3 className={clsx(styles.detailHeader, 'text', 'text_type_main-large')}>
      Детали ингредиента
    </h3>
    <IngredientDetails />
  </div>
);

const OrderPage = (): React.JSX.Element => {
  const { number = '' } = useParams();

  return (
    <div className={styles.detailPageWrap}>
      <h3 className={clsx(styles.detailHeader, 'text', 'text_type_digits-default')}>
        {formatOrderNumber(number)}
      </h3>
      <OrderInfo />
    </div>
  );
};

const IngredientModal = ({ onClose }: ModalRouteProps): React.JSX.Element => (
  <Modal title="Детали ингредиента" onClose={onClose}>
    <IngredientDetails />
  </Modal>
);

const OrderModal = ({ onClose }: ModalRouteProps): React.JSX.Element => {
  const { number = '' } = useParams();

  return (
    <Modal title={formatOrderNumber(number)} onClose={onClose}>
      <OrderInfo />
    </Modal>
  );
};

const RouteComponent = (): React.JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = location.state as LocationState | null;
  const backgroundLocation = locationState?.background;

  const handleModalClose = (): void => {
    void navigate(-1);
  };

  return (
    <>
      <Routes location={backgroundLocation ?? location}>
        <Route path="/" element={<ConstructorPage />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/feed/:number" element={<OrderPage />} />
        <Route path="/ingredients/:id" element={<IngredientPage />} />
        <Route
          path="/login"
          element={
            <ProtectedRoute onlyUnAuth>
              <Login />
            </ProtectedRoute>
          }
        />
        <Route
          path="/register"
          element={
            <ProtectedRoute onlyUnAuth>
              <Register />
            </ProtectedRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <ProtectedRoute onlyUnAuth>
              <ForgotPassword />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <ProtectedRoute onlyUnAuth>
              <ResetPassword />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/orders"
          element={
            <ProtectedRoute>
              <ProfileOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/orders/:number"
          element={
            <ProtectedRoute>
              <OrderPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound404 />} />
      </Routes>

      {backgroundLocation && (
        <Routes>
          <Route
            path="/feed/:number"
            element={<OrderModal onClose={handleModalClose} />}
          />
          <Route
            path="/ingredients/:id"
            element={<IngredientModal onClose={handleModalClose} />}
          />
          <Route
            path="/profile/orders/:number"
            element={
              <ProtectedRoute>
                <OrderModal onClose={handleModalClose} />
              </ProtectedRoute>
            }
          />
        </Routes>
      )}
    </>
  );
};

/* Маршруты показываются только когда ингредиенты загружены: без них не
   отрисовать ни конструктор, ни состав заказа. */
const AppContent = ({
  ingredients,
  isLoading,
  error,
}: AppContentProps): React.JSX.Element => {
  if (isLoading) {
    return <Preloader />;
  }

  if (error) {
    return (
      <p className={clsx(styles.message, 'text', 'text_type_main-medium')}>
        Не удалось загрузить ингредиенты
        {error.message ? `: ${error.message}` : '.'}
      </p>
    );
  }

  if (!ingredients.length) {
    return (
      <p className={clsx(styles.message, 'text', 'text_type_main-medium')}>
        Нет ингредиентов
      </p>
    );
  }

  return <RouteComponent />;
};

const App = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const ingredients = useSelector(selectIngredients);
  const isIngredientsLoading = useSelector(selectIngredientsLoading);
  const ingredientsError = useSelector(selectIngredientsError);

  useEffect(() => {
    void dispatch(fetchIngredients());
    void dispatch(checkUserAuth());
  }, [dispatch]);

  return (
    <div className={styles.app}>
      <AppHeader />
      <AppContent
        ingredients={ingredients}
        isLoading={isIngredientsLoading}
        error={ingredientsError}
      />
    </div>
  );
};

export default App;
