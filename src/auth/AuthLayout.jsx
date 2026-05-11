import bg from "../assets/pistisTrybeBg.png";

const AuthLayout = ({ children }) => {
  return (
    <div className="relative min-h-screen flex items-center">

      {/* Gradient layer */}
      {/* <div className="absolute inset-0 bg-gradient-to-t from-blue-900 via-indigo-600 to-purple-500" /> */}

      {/* Background image layer */}
      <div
        className="hidden md:block absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bg})` }}
      />

      {/* Content container */}
      <div className="relative w-full flex justify-center lg:justify-start px-6 lg:px-16">
        <div className="w-full max-w-md">{children}</div>
      </div>

      {/* Overlay text */}
      <div className="hidden md:block absolute left-[40%] bottom-20 text-white font-[roboto]">
        <h1 className="md:text-7xl ">The Family of <br /> The Pistis Place</h1>
        <p className="text-xl font-sans my-2">Where Convictions are birthed</p>
      </div>
    </div>
  );
};


export default AuthLayout;
