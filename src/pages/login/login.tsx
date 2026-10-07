import { LoginUI } from '@ui-pages';
import { type SyntheticEvent, useEffect, useState } from 'react';

import { clearUserError, loginUser, selectUserError } from '@services/slices/user-slice';
import { useDispatch, useSelector } from '@services/store';

export const Login = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const loginError = useSelector(selectUserError);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    dispatch(clearUserError());
  }, [dispatch]);

  /* После успешного входа пользователь появится в сторе, и ProtectedRoute
     сам перенаправит его на исходную страницу или на главную. */
  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();
    void dispatch(loginUser({ email, password }));
  };

  return (
    <LoginUI
      errorText={loginError?.message}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      handleSubmit={handleSubmit}
    />
  );
};
