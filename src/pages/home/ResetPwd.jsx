import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "../../auth/AuthLayout";
import AuthCard from "../../auth/AuthCard";
import Input from "../../shared/Input";
import Button from "../../shared/Btn";
import useForm from "../../hooks/UseForm";
import { resetPwd } from "../../services/AuthService";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const validate = (values) => {
    const errors = {};
    if (!values.newPassword) errors.newPassword = "Password is required";
    else if (values.newPassword.length < 8) errors.newPassword = "At least 8 characters";
    else if (!/\d/.test(values.newPassword)) errors.newPassword = "Must contain a number";
    else if (!/[^A-Za-z0-9]/.test(values.newPassword)) errors.newPassword = "Must contain a special character";
    if (!values.confirmPassword) errors.confirmPassword = "Please confirm your password";
    else if (values.confirmPassword !== values.newPassword) errors.confirmPassword = "Passwords do not match";
    return errors;
  };

  const { values, errors, handleChange, handleSubmit } = useForm(
    { newPassword: "", confirmPassword: "" },
    validate
  );

  const onSubmit = async () => {
    if (!token || !email) {
      setServerError("Invalid reset link. Please request a new one.");
      return;
    }
    try {
      setLoading(true);
      setServerError("");
      await resetPwd({ token, email, newPassword: values.newPassword });
      setSuccessMsg("Password reset successfully!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setServerError(error?.message || "Reset failed. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard title="Reset Password" message="Create a new password for your account">
        {serverError && (
          <div className="mb-4 text-sm text-red-500 text-center">{serverError}</div>
        )}
        {successMsg ? (
          <div className="mb-4 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            {successMsg} Redirecting to login...
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <Input
              name="newPassword"
              type="password"
              placeholder="New Password"
              value={values.newPassword}
              onChange={handleChange}
              error={errors.newPassword}
            />
            <p className="text-xs text-gray-500 -mt-3">
              At least <strong>8 characters</strong> with a <strong>number</strong> and <strong>special character</strong>.
            </p>
            <Input
              name="confirmPassword"
              type="password"
              placeholder="Confirm New Password"
              value={values.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
            />
            <Button type="submit" loading={loading}>
              Save Password
            </Button>
          </form>
        )}
      </AuthCard>
    </AuthLayout>
  );
};

export default ResetPassword;
