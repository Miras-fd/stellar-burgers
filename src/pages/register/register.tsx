import { RegisterUI } from '@ui-pages';
import { type SyntheticEvent, useEffect, useState } from 'react';

import {
  clearUserError,
  registerUser,
  selectUserError,
} from '@services/slices/user-slice';
import { useDispatch, useSelector } from '@services/store';

export const Register = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const registerError = useSelector(selectUserError);
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    dispatch(clearUserError());
  }, [dispatch]);

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();
    void dispatch(registerUser({ name: userName, email, password }));
  };

  return (
    <RegisterUI
      errorText={registerError?.message}
      email={email}
      userName={userName}
      password={password}
      setEmail={setEmail}
      setPassword={setPassword}
      setUserName={setUserName}
      handleSubmit={handleSubmit}
    />
  );
};
