import React from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { userInfoState, userPkState } from "../atom/authAtoms.js";
import { updateUserInfoAPI } from "../api/api";
import OnboardingSurvey from "../components/homePage/OnboardingSurvey";
import SideBar from "../components/sideBar/SideBar.jsx";
import { sideBarState } from "../atom/sidebarAtom";

const Edit = () => {
  const [userData, setUserData] = useRecoilState(userInfoState);
  const [userPk, setUserPK] = useRecoilState(userPkState);
  const navigate = useNavigate();
  const [open] = useRecoilState(sideBarState);

  const handleEditComplete = async (answers) => {
    try {
      const [_, goalLevel, background, major, topics] = answers; // past level 제외

      // 백엔드 API 호출하여 사용자 정보 업데이트
      const response = await updateUserInfoAPI({
        user_pk: userPk,
        goal_opic_level: goalLevel,
        background: background,
        occupation_or_major: major,
        topics_of_interest: topics,
      });

      if (response.status === "success") {
        // 로컬 상태 업데이트
        setUserData({
          ...userData,
          goal_opic_level: goalLevel,
          background: background,
          occupation_or_major: major,
          topics_of_interest: topics,
        });

        navigate("/home");
      } else {
        console.error("사용자 정보 업데이트 실패:", response.message);
      }
    } catch (error) {
      console.error("사용자 정보 업데이트 실패:", error);
    }
  };

  return (
    <div className="flex flex-row">
      <div
        className={`transition-all duration-300 ${
          open ? "w-[230px] min-w-[230px]" : "w-0 min-w-0"
        }`}
        style={{ overflow: open ? "visible" : "hidden" }}
      >
        <SideBar />
      </div>
      <div className="flex flex-col w-full h-screen bg-white px-12 mt-10 select-none">
        <div className="w-full max-w-2xl">
          <h2 className="text-2xl font-bold mb-8">Edit User Information</h2>
          <OnboardingSurvey 
            onComplete={handleEditComplete} 
            initialData={[
              userData.current_opic_level, // 현재 레벨을 past level로 사용
              userData.goal_opic_level || null,
              userData.background || null,
              userData.occupation_or_major || null,
              userData.topics_of_interest || []
            ]}
            isEditPage={true} // Edit 페이지에서 라우팅된 경우를 표시
          />
        </div>
      </div>
    </div>
  );
};

export default Edit;
