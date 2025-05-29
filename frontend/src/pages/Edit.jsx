import { useRecoilState } from "recoil";
import { userInfoState, userPkState } from "../atom/authAtoms.js";
import { useNavigate } from "react-router-dom";
import OnboardingSurvey from "../components/homePage/OnboardingSurvey";
import { updateUserInfoAPI } from "../api/api";
import SideBar from "../components/sideBar/SideBar.jsx";
import { sideBarState } from "../atom/sidebarAtom";

const Edit = () => {
  const [userData, setUserData] = useRecoilState(userInfoState);
  const [userPk, setUserPK] = useRecoilState(userPkState);
  const navigate = useNavigate();
  const [open] = useRecoilState(sideBarState);

  const handleEditComplete = async (answers) => {
    try {
      const [pastLevel, goalLevel, background, major, topics] = answers;

      // 백엔드 API 호출하여 사용자 정보 업데이트
      const response = await updateUserInfoAPI({
        user_pk: userPk,
        past_opic_level: pastLevel,
        goal_opic_level: goalLevel,
        background: background,
        occupation_or_major: major,
        topics_of_interest: topics,
      });

      if (response.status === "success") {
        // 로컬 상태 업데이트
        setUserData({
          ...userData,
          past_opic_level: pastLevel,
          goal_opic_level: goalLevel,
          background: background,
          occupation_or_major: major,
          topics_of_interest: topics,
        });

        navigate("/"); // 홈으로 이동
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
          <OnboardingSurvey onComplete={handleEditComplete} />
        </div>
      </div>
    </div>
  );
};

export default Edit;
