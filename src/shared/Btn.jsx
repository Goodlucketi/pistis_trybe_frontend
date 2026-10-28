const Button = ({
  children,
  type = "button",
  variant = "primary",
  loading = false,
  disabled = false,
  className = "",
  ...props
}) => {
  const baseStyles =
    "w-full py-3 rounded-xl font-semibold tracking-tight transition duration-200 active:scale-[0.99] disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-gray-300 text-white/90 opacity-70 !shadow-none",
    active: "bg-[#401667] text-white",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 border border-gray-200",
  };

  return (
    <button
      type={type}
      disabled={loading || disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
};

export default Button;
