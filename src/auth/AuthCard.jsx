import pistis_logo from "../assets/logos/pistis_logo.png"
const AuthCard = ({ children, title, message }) => {
  return (
    <div className="w-full max-w-md bg-slate-50 rounded-2xl shadow-lg p-6 sm:p-8 h-[650px]">
        <img src={pistis_logo} alt="Pistis Logo" className="mb-5" />
        <h2 className="text-2xl font-bold font-[bricolage]">
          {title}
        </h2>
        <p className="text-sm font-sans my-4">{message}</p>

        {children}
    </div>
  );
};

export default AuthCard;
