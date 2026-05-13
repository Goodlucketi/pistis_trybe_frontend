import { useState } from 'react';
import { GoogleLogin } from "@react-oauth/google";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../auth/AuthLayout";
import AuthCard from "../../auth/AuthCard";
import Input from "../../shared/Input";
import Button from "../../shared/Btn";
import useForm from "../../hooks/UseForm";
import { loginUser, googleLogin } from "../../services/AuthService";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const validate = (values) => {
    const errors = {};
    if (!values.email) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(values.email)) errors.email = "Email is invalid";
    if (!values.password) errors.password = "Password is required";
    return errors;
  };

  const { values, errors, handleChange, handleSubmit } = useForm(
    { email: "", password: "" },
    validate
  );

  const isFormValid = values.email && values.password && Object.keys(errors).length === 0;

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setServerError("");
      await googleLogin(credentialResponse.credential);
      navigate("/dashboard/feed");
    } catch (error) {
      setServerError(error?.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setServerError("Google sign-in was cancelled or failed");
  };

  const onSubmit = async () => {
    try {
      setLoading(true);
      setServerError("");
      await loginUser(values);
      navigate("/dashboard/feed");
    } catch (error) {
      setServerError(error?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard title="Sign In" message="Welcome back">
        {serverError && (
          <div className="mb-4 text-sm text-red-500 text-center">{serverError}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <Input name="email" type="email" placeholder="Email Address"
            value={values.email} onChange={handleChange} error={errors.email} />
          <Input name="password" type="password" placeholder="Password"
            value={values.password} onChange={handleChange} error={errors.password} />
          <Button type="submit" loading={loading}
            variant={isFormValid && !loading ? "active" : "primary"}
            disabled={!isFormValid || loading}>
            Sign In
          </Button>
        </form>

        <p className="text-right text-sm font-semibold my-2">
          <Link to="/forgot-password">Forgot Password?</Link>
        </p>

        <div className="flex items-center my-5 gap-3">
          <hr className="border-gray-300 w-full" />
          <p>or</p>
          <hr className="border-gray-300 w-full" />
        </div>

        <div className="flex justify-center">
          <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError}
            text="signin_with" shape="rectangular" size="large" width="100%" />
        </div>

        <p className="text-sm mt-6 text-gray-500 text-center">
          Don't have an account?{" "}
          <span onClick={() => navigate("/register")}
            className="text-purple-900 hover:underline cursor-pointer font-medium">
            Sign Up
          </span>
        </p>
      </AuthCard>
    </AuthLayout>
  );
};

export default Login;