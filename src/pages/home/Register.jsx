import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AuthLayout from "../../auth/AuthLayout";
import AuthCard from "../../auth/AuthCard";
import Input from "../../shared/Input";
import Button from "../../shared/Btn";
import useForm from "../../hooks/UseForm";

import { GoogleLogin } from "@react-oauth/google";
import { registerUser } from "../../services/AuthService";

const Register = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const validate = (values) => {
        const errors = {};

        if (!values.email) {
            errors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(values.email)) {
            errors.email = "Email is invalid";
        }

        if (!values.password) {
            errors.password = "Password is required";
        } else if (values.password.length < 8) {
            errors.password = "Password must be at least 8 characters";
        } else if (!/[0-9]/.test(values.password)) {
            errors.password = "Password must contain a number";
        } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(values.password)) {
            errors.password = "Password must contain a special character";
        }

        return errors;
    };

    const { values, errors, handleChange, handleSubmit } = useForm(
        {
            email: "",
            password: "",
        },
        validate
    );

    // Check if form is valid: both fields filled + no errors
    const isFormValid = 
        values.email && 
        values.password && 
        Object.keys(errors).length === 0;

    const onSubmit = async () => {
        try {
            setLoading(true);
            setServerError("");
            setSuccessMessage("");

            const payload = {
                email: values.email,
                password: values.password,
            };

            const data = await registerUser(payload);
            setSuccessMessage("Account created successfully!");

            setTimeout(() => {
                navigate("/login");
            }, 1500);

            console.log("Register success:", data);
        } catch (error) {
            setServerError(
                error?.message || "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSuccess = (response) => {
        console.log('Google Sign-In Success:', response);
    };

    const handleFailure = (response) => {
        console.error('Google Sign-In Failed:', response);
    };

    return (
        <AuthLayout>
            <AuthCard title="Create Account" message="Let's get you started">

                {serverError && (
                    <div className="mb-4 text-sm text-red-500 text-center">
                        {serverError}
                    </div>
                )}

                {successMessage && (
                    <div className="mb-4 text-sm text-green-600 text-center">
                        {successMessage}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex flex-col gap-3"
                >
                    <Input
                        name="email"
                        type="email"
                        value={values.email}
                        onChange={handleChange}
                        error={errors.email}
                        placeholder="Enter your email"
                    />

                    <Input
                        name="password"
                        type="password"
                        value={values.password}
                        onChange={handleChange}
                        error={errors.password}
                        placeholder="Create a password"
                    />

                    <p className="text-sm text-gray-500">
                        Password must be at least{" "}
                        <span className="font-semibold text-purple-900">8 characters</span>{" "}
                        long containing a{" "}
                        <span className="font-semibold text-purple-900">number</span> and a{" "}
                        <span className="font-semibold text-purple-900">special character</span>
                    </p>

                    <Button 
                        type="submit" 
                        loading={loading}
                        variant={isFormValid && !loading ? "active" : "primary"}
                        disabled={!isFormValid || loading}
                    >
                        Register
                    </Button>
                </form>

                <div className="flex justify-between items-center my-5 gap-3">
                    <hr className="border-gray-300 border-0 border-t-1 w-full" />
                    <p>or</p>
                    <hr className="border-gray-300 border-t-1 w-full" />
                </div>

                <GoogleLogin
                    onSuccess={handleSuccess}
                    onError={handleFailure}
                    useOneTap
                />

                <p className="text-sm mt-6 text-gray-500">
                    Already have an account?{" "}
                    <span
                        onClick={() => navigate("/login")}
                        className="text-purple-900 hover:underline cursor-pointer font-medium"
                    >
                        Login
                    </span>
                </p>
            </AuthCard>
        </AuthLayout>
    );
};

export default Register;