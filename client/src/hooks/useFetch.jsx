import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { notificationActions } from '../store/notificationSlice';
import { authActions } from '../store/authSlice';

const useFetch = ({ method, url }, successFn, errorFn, isLoginRequest = false) => {
  const [requestState, setRequestState] = useState('idle');
  const dispatch = useDispatch();
  const token = useSelector((state) => state.authReducer.token);

  const requestFunction = async (values) => {
    const methodUpper = method.toUpperCase();

    const fetchOptions = {
      method: methodUpper,
      headers: {
        'Content-Type': 'application/json',
        ...(token && !isLoginRequest && { 'Authorization': `Bearer ${token}` }),
        'Accept': 'application/json',
      },
      ...(methodUpper !== 'GET' && { body: JSON.stringify(values) }),
    };

    try {
      setRequestState('loading');
      const response = await fetch(`https://dutt-41dw.onrender.com${url}`, fetchOptions);

      const contentType = response.headers.get('Content-Type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text(); // Handle non-JSON responses if needed
      }

      if (!response.ok) {
        throw new Error(data.message || 'An error occurred');
      }

      setRequestState('success');
      successFn && successFn(data);
      return data;
    } catch (error) {
      setRequestState('error');
      dispatch(
        notificationActions.addNotification({
          message: error.message,
          type: 'error',
        })
      );

      if (error.message.includes('Unauthorized')) {
        dispatch(authActions.logout()); // Clear token and update state on unauthorized access
      }

      errorFn && errorFn(error);
    }
  };

  return {
    reqState: requestState,
    reqFn: requestFunction,
  };
};

export default useFetch;
