import { useState } from "react";

import AuthLayout from "../../auth/AuthLayout";
import AuthCard from "../../auth/AuthCard";
import Input from "../../shared/Input";
import Button from "../../shared/Btn";
import useForm from "../../hooks/UseForm";

import { forgotPwd } from "../../services/AuthService";

import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
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

        console.log("Password Status:", data);

        } catch (error) {
        setServerError(error.message || "Password failed");
        } finally {
        setLoading(false);
        }
    };

    return (
        <AuthLayout>
         <AuthCard title="Reset Password" message="Create a new password for your account" >
        
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
                    name="password"
                    type="email"
                    placeholder="Password"
                    value={values.password}
                    onChange={handleChange}
                    error={errors.password}
                />

                <p className="text-sm text-gray-500">
                    Password must be at least <span className="font-semibold text-purple-900"> 8 characters </span>long containing a <span className="font-semibold text-purple-900">number</span> and a <span className="font-semibold text-purple-900">special character</span> 
                </p>
                
                <Input
                    name="password"
                    type="email"
                    placeholder="Confirm new password"
                    value={values.password}
                    onChange={handleChange}
                    error={errors.password}
                />



                <Button type="submit" loading={loading}>
                    Save Password
                </Button>
            </form>
           
           
        </AuthCard>
        </AuthLayout>
    );
};

export default ResetPassword;
