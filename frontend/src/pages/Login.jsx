import React from "react";
import LoginRegisterInput from "../components/LoginSignUpInput";
import loginLogo from "../assets/loginPage/loginLogo.svg";
import login_image from "../assets/loginPage/login_image.svg";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { loginDataState } from "../api/authAtoms";
import { loginUserAPI } from "../api/api";

const Login = () => {
  const nav = useNavigate();
  const [loginData, setLoginData] = useRecoilState(loginDataState);

  const handleInputChange = (field, value) => {
    setLoginData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 로그인 처리 함수
  const handleLogin = async () => {
    // 테스트 계정
    if (loginData.id === "" && loginData.password === "") {
      console.log("테스트 계정 로그인 성공");
      nav("/");
      return;
    }

    // 서버 돌아갈 때
    const loginInfo = {
      id: loginData.id,
      pw: loginData.password,
    };
    try {
      const result = await loginUserAPI(loginInfo);
      console.log("로그인 성공:", result);
      nav("/");
    } catch (error) {
      if (error.response) {
        console.log("로그인 실패 코드:", error.response.status);
        alert("로그인 실패: " + (error.response.data?.message || "서버 오류"));
      } else {
        console.log("로그인 요청 실패:", error.message);
        alert("로그인 요청 실패: " + error.message);
      }
    }
  };

  return (
    <div className="flex flex-row min-h-screen bg-white select-none">
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
