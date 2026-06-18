import { useState } from "react";
import AuthLayout from "../../auth/AuthLayout";
import AuthCard from "../../auth/AuthCard";
import Input from "../../shared/Input";
import Button from "../../shared/Btn";
import useForm from "../../hooks/UseForm";
import { forgotPwd } from "../../services/AuthService";

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const validate = (values) => {
    const errors = {};
    if (!values.email) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(values.email)) errors.email = "Enter a valid email";
    return errors;
  };

  const { values, errors, handleChange, handleSubmit } = useForm({ email: "" }, validate);

  const onSubmit = async () => {
    try {
      setLoading(true);
      setServerError("");
      setSuccessMsg("");
      await forgotPwd({ email: values.email });
      setSuccessMsg(
        "If an account with that email exists, a reset link has been sent. Check your inbox."
      );
    } catch (error) {
      setServerError(error?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard title="Forgot Password" message="Enter the email used to create your account">
        {serverError && (
          <div className="mb-4 text-sm text-red-500 text-center">{serverError}</div>
        )}
        {successMsg ? (
          <div className="mb-4 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            {successMsg}
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <Input
              name="email"
              type="email"
              placeholder="Email Address"
              value={values.email}
              onChange={handleChange}
              error={errors.email}
            />
            <Button type="submit" loading={loading}>
              Send Reset Link
            </Button>
          </form>
        )}
      </AuthCard>
    </AuthLayout>
  );
};

export default ForgotPassword;
