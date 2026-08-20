
const IconButton = ({ icon, label, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 text-sm text-gray-500 hover:text-purple-600 transition"
    >
      {icon}
      {label}
    </button>
  );
};

export default IconButton;