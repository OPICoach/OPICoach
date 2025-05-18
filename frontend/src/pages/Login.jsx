import React, { useState } from "react";
import LoginRegisterInput from "../components/LoginSignUpInput";
import loginLogo from "../assets/loginPage/loginLogo.svg";
import login_image from "../assets/loginPage/login_image.svg";

import { useNavigate } from "react-router-dom";

const Login = () => {
  const nav = useNavigate();
  const [loginData, setLoginData] = useState({
    id: "",
    password: ""
  });

  const handleInputChange = (field, value) => {
    setLoginData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogin = () => {
    const loginInfo = {
      userId: loginData.id,
      userPassword: loginData.password
    };
    console.log("로그인 정보:", JSON.stringify(loginInfo, null, 2));
    nav("/");
  };

  return (
    <div className="flex flex-row min-h-screen bg-white">
      <div className="w-1/2 flex justify-center items-center">
        <div className="bg-opiLightGray p-1 w-[96%] h-[96%] flex justify-center items-center rounded-lg">
          <img
            src={login_image}
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
          <LoginRegisterInput 
            placeholder="id" 
            value={loginData.id}
            onChange={(e) => handleInputChange("id", e.target.value)}
          />
          <LoginRegisterInput
            placeholder="pw"
            type="password"
            showToggle={true}
            value={loginData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
          />
        </div>
        <button
          className="w-3/5 py-3 rounded-md bg-blue-500 text-white font-semibold text-lg mb-6 hover:bg-blue-600 transition"
          onClick={handleLogin}
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
