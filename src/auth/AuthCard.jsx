import pistis_logo from "../assets/logos/pistis_logo.png"
const AuthCard = ({ children, title, message }) => {
  return (
    <div className="ob-glass-strong w-full max-w-md rounded-3xl p-6 sm:p-8">
      <img src={pistis_logo} alt="Pistis Logo" className="mb-6 h-12 w-auto object-contain" />
      <h2 className="text-3xl font-bold font-[bricolage] text-gray-900">{title}</h2>
      <p className="text-sm text-gray-500 mt-2 mb-6">{message}</p>

      {children}
    </div>
  );
};

export default AuthCard;
