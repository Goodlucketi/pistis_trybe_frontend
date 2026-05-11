const Button = ({
  children,
  type = "button",
  variant = "primary",
  loading = true,
  className = "",
  ...props
}) => {
  const baseStyles =
    "w-full py-3 rounded-lg font-semibold transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-gray-300 text-white",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
  };

  return (
    <button
      type={type}
      disabled={loading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
};

export default Button;
