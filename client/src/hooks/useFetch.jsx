import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { notificationActions } from '../store/notificationSlice';
import { authActions } from '../store/authSlice'; // Import auth actions if needed

const useFetch = ({ method, url }, successFn, errorFn) => {
  const [requestState, setRequestState] = useState('idle');
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token); // Get token from Redux state

  const requestFunction = async (values) => {
    const methodUpper = method.toUpperCase();

    const fetchOptions = {
      method: methodUpper,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }), // Include token in header
      },
      ...(methodUpper !== 'GET' && { body: JSON.stringify(values) }),
    };

    try {
      setRequestState('loading');
      const response = await fetch(`https://your-api-url.com${url}`, fetchOptions);
      const data = methodUpper !== 'DELETE' ? await response.json() : undefined;

      if (!response.ok) throw new Error(data.message || 'An error occurred');

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
      errorFn && errorFn(error);
    }
  };

  return {
    reqState: requestState,
    reqFn: requestFunction,
  };
};

export default useFetch;
