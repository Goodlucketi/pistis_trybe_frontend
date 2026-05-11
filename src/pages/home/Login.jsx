import { useState } from 'react';
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout from "../../auth/AuthLayout";
import AuthCard from "../../auth/AuthCard";
import Input from "../../shared/Input";
import Button from "../../shared/Btn";
import useForm from "../../hooks/UseForm";

import { loginUser } from "../../services/AuthService";

const Login = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const validate = (values) => {
    const errors = {};
    if (!values.email) errors.email = "Email is required";
    if (!values.password) errors.password = "Password is required";
    return errors;
  };

  const { values, errors, handleChange, handleSubmit } = useForm(
    { email: "", password: "" },
    validate
  );

  const handleGoogleSuccess = (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      console.log("Google User:", decoded);

      localStorage.setItem("user", JSON.stringify(decoded));

      // ✅ Fixed: leading slash
      navigate("/dashboard/feed");
    } catch (error) {
      console.error("Google Login Error:", error);
      setServerError("Google login failed");
    }
  };

  const handleGoogleError = () => {
    console.error("Google Sign-In Failed");
    setServerError("Google login failed");
  };

  const onSubmit = async () => {
    try {
      setLoading(true);
      setServerError("");

      const data = await loginUser(values);

      if (data?.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
      }

      console.log("Login success:", data);
      navigate("/dashboard/feed");
    } catch (error) {
      setServerError(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard title="Sign In" message="Welcome back">
        
        {serverError && (
          <div className="mb-4 text-sm text-red-500 text-center">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <Input
            name="email"
            type="email"
            placeholder="Email Address"
            value={values.email}
            onChange={handleChange}
            error={errors.email}
          />

          <Input
            name="password"
            type="password"
            placeholder="Password"
            value={values.password}
            onChange={handleChange}
            error={errors.password}
          />

          <Button type="submit" loading={loading}>
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

        {/* ✅ Only render one GoogleLogin, inside the return */}
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          useOneTap={false} // disable to reduce console warnings
        />

        <p className="text-sm mt-6 text-gray-500 text-center">
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-purple-900 hover:underline cursor-pointer font-medium"
          >
            Sign Up
          </span>
        </p>
      </AuthCard>
    </AuthLayout>
  );
};

export default Login;