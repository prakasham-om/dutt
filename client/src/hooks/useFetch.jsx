import { useState } from "react";
import { useDispatch } from "react-redux";
import { notificationActions } from "../store/notificationSlice";

const useFetch = ({ method, url }, successFn, errorFn) => {
  const [requestState, setRequestState] = useState("idle");
  const dispatch = useDispatch();

  const requestFunction = async (values) => {
    const methodUpper = method.toUpperCase();
    const fetchOptions =
      methodUpper !== "GET"
        ? {
            method: methodUpper,
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(values),
          }
        : {};

    try {
      setRequestState("loading");
      const response = await fetch(`https://dutt-41dw.onrender.com/api${url}`, fetchOptions);

      if (!response.ok) {
        let errorMessage = "An error occurred";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || "An error occurred";
        } catch (error) {
          // Fallback if response is not valid JSON
        }
        throw new Error(errorMessage);
      }

      const data = methodUpper !== "DELETE" ? await response.json() : null;
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
