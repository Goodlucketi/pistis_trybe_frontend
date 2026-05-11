const Input = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
}) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-gray-600">
          {label}
        </label>
      )}

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition
          ${
            error
              ? "border-red-500 focus:ring-red-200"
              : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"
          }`}
      />

      {error && (
        <span className="text-xs text-red-500">{error}</span>
      )}
    </div>
  );
};

export default Input;
