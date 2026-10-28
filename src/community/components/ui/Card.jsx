const Card = ({ children, className = "" }) => {
  return (
    <div className={`ob-glass rounded-2xl ${className}`}>
      {children}
    </div>
  );
};

export default Card;
