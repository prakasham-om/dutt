import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { notificationActions } from '../store/notificationSlice';
import { authActions } from '../store/authSlice'; // Import auth actions

const useFetch = ({ method, url }, successFn, errorFn) => {
  const [requestState, setRequestState] = useState('idle');
  const dispatch = useDispatch();
  const token = useSelector((state) => state.authReducer.token); // Access token from authSlice

  const requestFunction = async (values) => {
    const methodUpper = method.toUpperCase();
    
    const fetchOptions = {
      method: methodUpper,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }), // Include token if available
         'Accept': 'application/json'
      },
      ...(methodUpper !== 'GET' && { body: JSON.stringify(values) }), 
    };

    try {
      setRequestState('loading');
      const response = await fetch(`https://dutt-41dw.onrender.com${url}`, fetchOptions);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'An error occurred');
      }

      const data = methodUpper !== 'DELETE' ? await response.json() : null;
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
