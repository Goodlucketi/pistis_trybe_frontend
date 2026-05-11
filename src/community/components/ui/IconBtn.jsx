
export const IconButton = ({ icon: Icon, label, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 text-sm text-gray-500 hover:text-purple-600 transition"
    >
      <Icon size={18} />
      {label}
    </button>
  );
};

export default IconButton;