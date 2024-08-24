import React from "react";
import * as Yup from "yup";
import { Formik, Form } from "formik";
import FormField from "../../globals/FormField";
import useFetch from "../../../hooks/useFetch";
import { useDispatch } from "react-redux";
import { authActions } from "../../../store/authSlice";
import Spinner from "../../globals/Spinner";

const schema = Yup.object().shape({
  username: Yup.string().required("Field is required"),
  password: Yup.string().required("Field is required"),
});

function Login({ setUserWantsToLogin }) {
  const dispatch = useDispatch();
  
  // Define the success function with logging
  const handleSuccess = (data) => {
    console.log("Login response:", data); // Log the response data
    dispatch(authActions.login());
  };

  // Define the error function if needed
  const handleError = (error) => {
    console.error("Login error:", error);
  };

  // Request to log user in
  const { reqState, reqFn: loginRequest } = useFetch(
    { url: "/user/login", method: "POST" },
    handleSuccess,
    handleError
  );

  return (
    <div className="basis-[35rem]">
      <h1 className="text-cta-icon font-semibold text-[2rem] uppercase mb-[2rem]">
        Login To Telegram
      </h1>
      <Formik
        initialValues={{
          username: "",
          password: "",
        }}
        validationSchema={schema}
        onSubmit={(values, actions) => {
          loginRequest(values)
            .catch(error => console.error("Submission error:", error));
        }}
      >
        {({ errors, values }) => (
          <Form className="flex flex-col gap-[1.5rem]" autoComplete="off">
            <FormField
              labelName="Username"
              labelClassName={`bg-transparent group-focus-within:hidden ${
                values.username && "hidden"
              }`}
              name="username"
              required={true}
              value={values.username}
              error={errors.username}
            />

            <FormField
              labelName="Password"
              labelClassName={`bg-transparent group-focus-within:hidden ${
                values.password && "hidden"
              }`}
              name="password"
              required={true}
              value={values.password}
              error={errors.password}
              fieldType="password"
            />
            <button
              className={`bg-cta-icon mt-[1rem] p-[1rem] rounded-xl uppercase text-white font-semibold opacity-80 flex items-center justify-center ${
                !errors.username && !errors.password && "opacity-100"
              }`}
              type="submit"
            >
              {reqState !== "loading" && "Login"}
              {reqState === "loading" && (
                <Spinner className="w-[2.5rem] h-[2.5rem]" />
              )}
            </button>
          </Form>
        )}
      </Formik>
      <div
        onClick={() => setUserWantsToLogin(false)}
        className="mt-[2rem] text-right text-secondary-text underline cursor-pointer hover:text-cta-icon"
      >
        New to Telegram
      </div>
    </div>
  );
}

export default Login;
