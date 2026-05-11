import { useState } from "react";

import AuthLayout from "../../auth/AuthLayout";
import AuthCard from "../../auth/AuthCard";
import Input from "../../shared/Input";
import Button from "../../shared/Btn";
import useForm from "../../hooks/UseForm";

import { forgotPwd } from "../../services/AuthService";

import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
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


    const onSubmit = async () => {
        try {
        setLoading(true);
        setServerError("");

        const data = await forgotPwd(values);

        // Example: store token
        if (data.accessToken) {
            localStorage.setItem("accessToken", data.accessToken);
        }

        console.log("Password Reset:", data);

        } catch (error) {
        setServerError(error.message || "Password Reset failed");
        } finally {
        setLoading(false);
        }
    };

    return (
        <AuthLayout>
       
        <AuthCard title="Forgot Password" message="Enter email used to create the account" >
            {serverError && (
            <div className="mb-4 text-sm text-red-500 text-center">
                {serverError}
            </div>
            )}

            <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
            >
                <Input
                    name="email"
                    type="email"
                    placeholder="Email Address"
                    value={values.email}
                    onChange={handleChange}
                    error={errors.email}
                />

                <Button type="submit" loading={loading}>
                    Continue
                </Button>
            </form>
           
           
        </AuthCard>
        </AuthLayout>
    );
};

export default ForgotPassword;
