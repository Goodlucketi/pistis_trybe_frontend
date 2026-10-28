import Logo from "../shared/Logo";
const AuthCard = ({ children, title, message }) => {
  return (
    <div className="ob-glass-strong w-full max-w-md rounded-3xl p-6 sm:p-8">
      <Logo className="mb-6" markClassName="w-12 h-12" textClassName="text-3xl" />
      <h2 className="text-3xl font-bold font-[bricolage] text-gray-900">{title}</h2>
      <p className="text-sm text-gray-500 mt-2 mb-6">{message}</p>

      {children}
    </div>
  );
};

export default AuthCard;
