import { useState } from "react";
import { useDispatch } from "react-redux";
import { notificationActions } from "../store/notificationSlice";

const useFetch = ({ method, url }, successFn, errorFn) => {
  const [requestState, setRequestState] = useState("idle"); // Set initial state to 'idle'
  const dispatch = useDispatch();

  const requestFunction = async (values) => {
    const methodUpper = method.toUpperCase();

    const fetchOptions = {
      method: methodUpper,
      headers: {
        "Content-Type": "application/json",
        // You can add more headers here if needed
      },
      ...(methodUpper !== "GET" && { body: JSON.stringify(values) }), // Add body only if method is not GET
      credentials: "include", // Include cookies with requests (if needed)
    };

    try {
      setRequestState("loading");
      const response = await fetch(`/api${url}`, fetchOptions);
      
      // Handle non-JSON responses gracefully
      let data = {};
      if (response.headers.get("Content-Type")?.includes("application/json")) {
        data = await response.json();
      }

      if (!response.ok) {
        throw new Error(data.message || "An error occurred");
      }

      setRequestState("success");
      successFn && successFn(data);
      return data;
    } catch (error) {
      setRequestState("error");
      dispatch(
        notificationActions.addNotification({
          message: error.message || "An error occurred",
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
