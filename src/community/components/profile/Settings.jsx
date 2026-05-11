import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { changePassword } from "../../../services/AuthService";
import getErrorMessage from "../../../hooks/useErrorToast";

const Settings = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    current: false, new: false, confirm: false,
  });
  const [successMsg, setSuccessMsg] = useState("");

  const hasUppercase = /[A-Z]/.test(formData.newPassword);
  const hasNumber = /\d/.test(formData.newPassword);
  const hasMinLength = formData.newPassword.length >= 8;
  const passwordsMatch = formData.newPassword === formData.confirmPassword && formData.confirmPassword !== "";
  const isFormValid = formData.currentPassword && hasUppercase && hasNumber && hasMinLength && passwordsMatch;

  const mutation = useMutation({
    mutationFn: () => changePassword({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
    }),
    onSuccess: () => {
      setSuccessMsg("Password changed successfully!");
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setSuccessMsg(""), 3000);
    },
    onError: (error) => alert(getErrorMessage(error)),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="p-4">
      {/* Back button */}
      <button
        onClick={() => navigate("/dashboard/profile")}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Profile
      </button>

      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Settings</h1>
      <h2 className="text-lg font-semibold text-gray-800">Change Password</h2>
      <p className="text-sm text-gray-500 mb-6">Update password for enhanced account security.</p>
      <hr className="mb-6 border-gray-200" />

      {successMsg && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">
          {successMsg}
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); if (isFormValid) mutation.mutate(); }} className="space-y-4">
        {[
          { label: "Current Password", name: "currentPassword", field: "current" },
          { label: "New Password", name: "newPassword", field: "new", placeholder: "Enter your new password" },
          { label: "Confirm New Password", name: "confirmPassword", field: "confirm", placeholder: "Confirm your new password" },
        ].map(({ label, name, field, placeholder }) => (
          <div key={name}>
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <div className="relative">
              <input
                type={showPassword[field] ? "text" : "password"}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              <button
                type="button"
                onClick={() => toggleVisibility(field)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword[field] ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>
        ))}

        {/* Password rules */}
        <div className={`overflow-hidden transition-all duration-300 ${formData.newPassword ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
          <p className="font-medium text-gray-700 text-sm">Must contain at least:</p>
          {[
            { label: "1 uppercase letter", met: hasUppercase },
            { label: "1 number", met: hasNumber },
            { label: "8 characters", met: hasMinLength },
          ].map(({ label, met }) => (
            <p key={label} className={`text-sm ${met ? "text-green-600" : "text-gray-500"}`}>• {label}</p>
          ))}
          {!passwordsMatch && formData.confirmPassword && (
            <p className="text-sm text-red-500">• Passwords do not match</p>
          )}
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" })}
            className="px-5 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isFormValid || mutation.isPending}
            className={`px-5 py-2 rounded-xl text-white transition ${isFormValid && !mutation.isPending ? "bg-[#401667] hover:opacity-90" : "bg-[#401667]/60 cursor-not-allowed"}`}
          >
            {mutation.isPending ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;