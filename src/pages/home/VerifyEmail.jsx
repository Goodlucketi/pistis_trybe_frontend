import { useEffect, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../../auth/AuthLayout";
import AuthCard from "../../auth/AuthCard";
import Button from "../../shared/Btn";
import { verifyEmail, resendOtp } from "../../services/AuthService";

const CODE_LENGTH = 6;

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || sessionStorage.getItem("pistis-pending-email") || "";

  const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [info, setInfo] = useState("");
  const [cooldown, setCooldown] = useState(location.state?.resendAfterSeconds ?? 0);
  const inputs = useRef([]);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  if (!email) return <Navigate to="/register" replace />;

  const code = digits.join("");

  const submit = async (value) => {
    try {
      setLoading(true);
      setServerError("");
      const { user } = await verifyEmail({ email, otp: value });
      sessionStorage.removeItem("pistis-pending-email");
      navigate(user?.role === "admin" || user?.role === "super_admin" ? "/admin" : "/dashboard/feed", { replace: true });
    } catch (error) {
      setServerError(error?.message || "Verification failed. Please try again.");
      setDigits(Array(CODE_LENGTH).fill(""));
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index, raw) => {
    const value = raw.replace(/\D/g, "");
    if (!value) {
      setDigits((prev) => prev.map((d, i) => (i === index ? "" : d)));
      return;
    }
    const next = [...digits];
    value.slice(0, CODE_LENGTH - index).split("").forEach((char, offset) => {
      next[index + offset] = char;
    });
    setDigits(next);
    const focusIndex = Math.min(index + value.length, CODE_LENGTH - 1);
    inputs.current[focusIndex]?.focus();
    if (next.every(Boolean)) submit(next.join(""));
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) inputs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < CODE_LENGTH - 1) inputs.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    const next = Array(CODE_LENGTH).fill("").map((_, i) => pasted[i] || "");
    setDigits(next);
    inputs.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus();
    if (pasted.length === CODE_LENGTH) submit(pasted);
  };

  const handleResend = async () => {
    try {
      setServerError("");
      setInfo("");
      const { message, data } = await resendOtp({ email });
      setInfo(data?.sent ? "A new code is on its way." : message);
      setCooldown(data?.resendAfterSeconds ?? 0);
    } catch (error) {
      setServerError(error?.message || "Could not resend the code.");
    }
  };

  return (
    <AuthLayout>
      <AuthCard title="Verify your email" message={`Enter the 6-digit code we sent to ${email}`}>
        {serverError && <div className="mb-4 text-sm text-red-500 text-center">{serverError}</div>}
        {info && <div className="mb-4 text-sm text-green-600 text-center">{info}</div>}

        <div className="flex justify-between gap-2 mb-6" onPaste={handlePaste}>
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputs.current[index] = el)}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              inputMode="numeric"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              maxLength={CODE_LENGTH}
              aria-label={`Digit ${index + 1}`}
              disabled={loading}
              className="w-full aspect-square max-w-[3.25rem] text-center text-xl font-semibold rounded-xl border border-gray-300 bg-white/60 text-gray-900"
            />
          ))}
        </div>

        <Button
          type="button"
          loading={loading}
          variant={code.length === CODE_LENGTH && !loading ? "active" : "primary"}
          disabled={code.length !== CODE_LENGTH || loading}
          onClick={() => submit(code)}
        >
          Verify
        </Button>

        <p className="text-sm mt-6 text-gray-500 text-center">
          Didn't get it?{" "}
          {cooldown > 0 ? (
            <span>Resend in {cooldown}s</span>
          ) : (
            <button type="button" onClick={handleResend} className="text-purple-900 hover:underline font-medium">
              Resend code
            </button>
          )}
        </p>
        <p className="text-sm mt-2 text-gray-500 text-center">
          <button type="button" onClick={() => navigate("/register")} className="hover:underline">
            Use a different email
          </button>
        </p>
      </AuthCard>
    </AuthLayout>
  );
};

export default VerifyEmail;
