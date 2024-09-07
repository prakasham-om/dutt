import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { notificationActions } from '../store/notificationSlice';


const useFetch = ({ method, url }, successFn, errorFn) => {
  const [requestState, setRequestState] = useState('idle');
  const dispatch = useDispatch();
  const token = useSelector((state) => state.authReducer.token); // Get token from Redux state

  const requestFunction = async (values) => {
    const methodUpper = method.toUpperCase();

    const fetchOptions = {
      method: methodUpper,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }), // Include token in header if available
      },
      ...(methodUpper !== 'GET' && { body: JSON.stringify(values) }), // Add body for non-GET requests
    };

    try {
      setRequestState('loading');
      const response = await fetch(`https://your-api-url.com${url}`, fetchOptions);
      
      let data;
      if (methodUpper !== 'DELETE') {
        data = await response.json();
      }

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

      // Optionally handle specific error cases, like unauthorized access
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
