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
    else if (!/\S+@\S+\.\S+/.test(values.email)) errors.email = "Email is invalid";
    
    if (!values.password) errors.password = "Password is required";
    else if (values.password.length < 6) errors.password = "Password must be 6+ characters";
    return errors;
  };

  const { values, errors, handleChange, handleSubmit } = useForm(
    { email: "", password: "" },
    validate
  );

  // Check if form is valid: no errors + both fields have values
  const isFormValid = 
    values.email && 
    values.password && 
    Object.keys(errors).length === 0;

  const handleGoogleSuccess = (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      console.log("Google User:", decoded);
      localStorage.setItem("user", JSON.stringify(decoded));
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
      // console.log("Login success:", data);
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

          <Button 
            type="submit" 
            loading={loading}
            variant={isFormValid && !loading ? "active" : "primary"}
            disabled={!isFormValid || loading}
          >
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

        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          useOneTap={false}
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