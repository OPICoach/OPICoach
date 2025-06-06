import { useNavigate } from "react-router-dom";
import LoginRegisterInput from "../components/LoginSignUpInput";
import loginLogo from "../assets/loginPage/loginLogo.svg";
import { useRecoilState } from "recoil";
import { signUpDataState } from "../atom/authAtoms";
import { signupUserAPI } from "../api/api";
import { useState } from "react";
import { surveyState } from "../atom/sidebarAtom";

const SignUp = () => {
  const navigate = useNavigate();
  const [signUpData, setSignUpData] = useRecoilState(signUpDataState);
  const [error, setError] = useState("");
  const [survey, setSurvey] = useRecoilState(surveyState);

  const handleInputChange = (field, value) => {
    setSignUpData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError(""); // 입력이 변경될 때마다 에러 메시지 초기화
  };

  const handleSignUp = async () => {
    const signUpInfo = {
      name: signUpData.name,
      email: signUpData.email,
      id: signUpData.id,
      pw: signUpData.password,
    };
    try {
      const response = await signupUserAPI(signUpInfo);
      if (response.status === "success") {
        console.log("회원가입 성공:", response);
        setSurvey(true);
        navigate("/login");
      } else {
        setError(response.message || "회원가입에 실패했습니다.");
      }
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message || "회원가입에 실패했습니다.");
      } else {
        setError("회원가입 요청 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <div className="flex flex-row min-h-screen bg-white">
      <div className="w-1/2 flex justify-center items-center">
        <div className="bg-opiLightGray p-1 w-[96%] h-[96%] flex justify-center items-center rounded-lg">
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
        {error && (
          <div className="text-red-500 text-sm text-center mb-4">{error}</div>
        )}
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
