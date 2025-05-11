import React from "react";
import LoginRegisterInput from "../components/LoginSignUpInput";
import loginLogo from "../assets/loginPage/loginLogo.svg";

import { useNavigate } from "react-router-dom";

const Login = () => {
  const nav = useNavigate();
  return (
    <div className="flex flex-row min-h-screen bg-white">
      <div className="w-1/2 flex justify-center items-center">
        <div className="bg-opiLightGray p-1 w-[96%] h-[96%] flex justify-center items-center">
          <img
            src="./src/assets/loginPage/login_image.svg"
            alt="Login"
            className="w-4/5 h-auto object-contain"
          />
        </div>
      </div>
      <div className="w-1/2 flex flex-col justify-center items-center">
        <div className="mb-10 select-none">
          <div className="flex items-center justify-center h-24">
            <img src={loginLogo} alt="OPICoach Logo" className="h-14" />
          </div>
        </div>
        <div className="w-3/5 flex flex-col gap-4 mb-6">
          <LoginRegisterInput placeholder="id" />
          <LoginRegisterInput
            placeholder="pw"
            type="password"
            showToggle={true}
          />
        </div>
        <button
          className="w-3/5 py-3 rounded-md bg-blue-500 text-white font-semibold text-lg mb-6 hover:bg-blue-600 transition"
          onClick={() => nav("/")}
        >
          Login
        </button>
        <div className="w-3/5 flex flex-col items-center gap-1 text-sm">
          <a href="#" className="text-opiGray hover:underline">
            Forgot Password?
          </a>
          <a href="/signup" className="text-opiGray hover:underline">
            Have no Account?
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
