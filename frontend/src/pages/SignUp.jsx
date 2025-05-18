import { useNavigate } from "react-router-dom";
import LoginRegisterInput from "../components/LoginSignUpInput";
import loginLogo from "../assets/loginPage/loginLogo.svg";
import { useState } from "react";

const SignUp = () => {
  const navigate = useNavigate();
  const [signUpData, setSignUpData] = useState({
    name: "",
    email: "",
    id: "",
    password: ""
  });

  const handleInputChange = (field, value) => {
    setSignUpData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSignUp = () => {
    const signUpInfo = {
      userName: signUpData.name,
      userEmail: signUpData.email,
      userId: signUpData.id,
      userPassword: signUpData.password
    };
    console.log("회원가입 정보:", JSON.stringify(signUpInfo, null, 2));
    navigate("/login");
  };

  return (
    <div className="flex flex-row min-h-screen bg-white">
      <div className="w-1/2 flex justify-center items-center">
        <div className="bg-opiLightGray p-1 w-[96%] h-[96%] flex justify-center items-center">
          <img
            src="./src/assets/loginPage/login_image.svg"
            alt="Sign Up"
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
            placeholder="name" 
            value={signUpData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
          />
          <LoginRegisterInput 
            placeholder="email" 
            value={signUpData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
          />
          <LoginRegisterInput 
            placeholder="id" 
            value={signUpData.id}
            onChange={(e) => handleInputChange("id", e.target.value)}
          />
          <LoginRegisterInput
            placeholder="pw"
            type="password"
            showToggle={true}
            value={signUpData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
          />
        </div>
        <button
          className="w-3/5 py-3 rounded-md bg-blue-500 text-white font-semibold text-lg mb-6 hover:bg-blue-600 transition"
          onClick={handleSignUp}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default SignUp;
