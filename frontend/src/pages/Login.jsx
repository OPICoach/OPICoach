import React from "react";
import LoginRegisterInput from "../components/LoginSignUpInput";
import loginLogo from "../assets/loginPage/loginLogo.svg";
import login_image from "../assets/loginPage/login_image.svg";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { loginDataState, userPkState } from "../api/authAtoms";
import { loginUserAPI } from "../api/api";

const Login = ({ setIsLoggedIn }) => {
  const nav = useNavigate();
  const [loginData, setLoginData] = useRecoilState(loginDataState);
  const [userPk, setUserPk] = useRecoilState(userPkState);

  const handleInputChange = (field, value) => {
    setLoginData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 백엔드 서버 안 켰을 때

  const handleLogin = () => {
    if (loginData.id === "1" && loginData.password === "test") {
      setUserPk(1); // 임의의 pk
      setIsLoggedIn(true);
      nav("/");
    } else {
      alert("아이디 또는 비밀번호가 올바르지 않습니다.");
    }
  };

  // 백엔드 서버 켰을 때

  // const handleLogin = async () => {
  //   const loginInfo = {
  //     id: loginData.id,
  //     pw: loginData.password,
  //   };
  //   try {
  //     const result = await loginUserAPI(loginInfo);

  //     if (!result || !result.pk) {
  //       alert("아이디 또는 비밀번호가 올바르지 않습니다.");
  //       return;
  //     }

  //     console.log("로그인 성공:", result);
  //     setUserPk(result.pk);
  //     setIsLoggedIn(true);
  //     nav("/");
  //   } catch (error) {
  //     if (error.response) {
  //       console.log("로그인 실패 코드:", error.response.status);
  //       alert("로그인 실패: " + (error.response.data?.message || "서버 오류"));
  //     } else {
  //       console.log("로그인 요청 실패:", error.message);
  //       alert("로그인 요청 실패: " + error.message);
  //     }
  //   }
  // };

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
