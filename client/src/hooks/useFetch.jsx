import { useState } from "react";
import { useDispatch } from "react-redux";
import { notificationActions } from "../store/notificationSlice";

const useFetch = ({ method, url }, successFn, errorFn) => {
  const [requestState, setRequestState] = useState(null);
  const dispatch = useDispatch();

  const requestFunction = async (values) => {
    const methodUpper = method.toUpperCase();

    const fetchOptions = {
      method: methodUpper,
      credentials: module,
      headers: {
        "Content-Type": "application/json",
      },
      ...(methodUpper !== "GET" && { body: JSON.stringify(values) }),
    };

    try {
      setRequestState("loading");
      const response = await fetch(`https://dutt-41dw.onrender.com/api${url}`, fetchOptions);

      let data = null;
      if (methodUpper !== "DELETE" && response.ok) {
        data = await response.json();
      }

      if (!response.ok) {
        // Handle error response
        const errorMessage = data?.message || "An error occurred";
        throw new Error(errorMessage);
      }

      setRequestState("success");
      successFn && successFn(data);
      return data;
    } catch (error) {
      setRequestState("error");
      dispatch(
        notificationActions.addNotification({
          message: error.message,
          type: "error",
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
