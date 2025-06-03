import React, { useState } from 'react';
import LoginRegisterInput from "../components/LoginSignUpInput";
import loginLogo from "../assets/loginPage/loginLogo.svg";
import login_image from "../assets/loginPage/login_image.svg";
import { useNavigate } from "react-router-dom";
import { useRecoilState, useSetRecoilState } from "recoil";
import { loginDataState, userPkState } from "../atom/authAtoms";
import { loginUserAPI, fetchUserInfo } from "../api/api";

const Login = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useRecoilState(loginDataState);
  const setUserPk = useSetRecoilState(userPkState);
  const [error, setError] = useState('');

  const handleInputChange = (field, value) => {
    setLoginData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      console.log('Login data:', loginData);
      const response = await loginUserAPI(loginData);
      if (response.status === 'success') {
        setUserPk(response.pk);
        setIsLoggedIn(true);
        
        // 사용자 정보 조회
        const userInfo = await fetchUserInfo(response.pk);
        if (userInfo.status === 'success') {
          // level_history가 비어있는 경우 (초기 회원가입 직후)
          if (!userInfo.user.level_history || userInfo.user.level_history.length === 0) {
            navigate('/onboarding');
          } else {
            navigate('/');
          }
        } else {
          navigate('/');
        }
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError('로그인 중 오류가 발생했습니다.');
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
            value={loginData.pw}
            onChange={(e) => handleInputChange("pw", e.target.value)}
          />
        </div>
        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}
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
