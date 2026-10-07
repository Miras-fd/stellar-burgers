import { ProfileUI } from '@ui-pages';
import { type SyntheticEvent, useEffect, useState } from 'react';

import {
  clearUserError,
  selectUser,
  selectUserError,
  updateUser,
} from '@services/slices/user-slice';
import { useDispatch, useSelector } from '@services/store';

import type { TRegisterData } from '@api';

export const Profile = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const updateUserError = useSelector(selectUserError);

  const [formValue, setFormValue] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    password: '',
  });

  useEffect(() => {
    dispatch(clearUserError());
  }, [dispatch]);

  /* После сохранения в сторе появляется обновлённый пользователь: форма
     синхронизируется с ним, и кнопки «Отмена» и «Сохранить» скрываются. */
  useEffect(() => {
    setFormValue({
      name: user?.name ?? '',
      email: user?.email ?? '',
      password: '',
    });
  }, [user]);

  const isFormChanged =
    formValue.name !== user?.name ||
    formValue.email !== user?.email ||
    !!formValue.password;

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();

    const changedUserData: Partial<TRegisterData> = {
      name: formValue.name,
      email: formValue.email,
    };

    if (formValue.password) {
      changedUserData.password = formValue.password;
    }

    void dispatch(updateUser(changedUserData));
  };

  const handleCancel = (e: SyntheticEvent): void => {
    e.preventDefault();
    setFormValue({
      name: user?.name ?? '',
      email: user?.email ?? '',
      password: '',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormValue((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <ProfileUI
      formValue={formValue}
      isFormChanged={isFormChanged}
      updateUserError={updateUserError?.message}
      handleCancel={handleCancel}
      handleSubmit={handleSubmit}
      handleInputChange={handleInputChange}
    />
  );
};
