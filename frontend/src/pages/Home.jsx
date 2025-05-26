import SideBar from "../components/sideBar/SideBar.jsx";
import HomeExistUser from "../components/homePage/HomeExistUser";
import HomeNewUser from "../components/homePage/HomeNewUser";
import { useRecoilState } from "recoil";
import { userInfoState } from "../api/atom.js";
import { updateUserInfoAPI } from "../api/api";
import { userPkState } from "../api/authAtoms.js";

const Home = () => {
  const [userData, setUserData] = useRecoilState(userInfoState);
  const [userPk, setUserPK] = useRecoilState(userPkState);

  const testDate = "2025-10-01"; // 예시로 사용된 테스트 날짜

  const handleOnboardingComplete = async (info) => {
    try {
      // 백엔드 API 호출하여 사용자 정보 업데이트
      const response = await updateUserInfoAPI({
        user_pk: userPk,
        past_opic_level: info.pastLevel,
        goal_opic_level: info.goalLevel,
        background: info.background,
        occupation_or_major: info.major,
        topics_of_interest: info.topics,
      });

      if (response.status === "success") {
        // 로컬 상태 업데이트
        setUserData({
          ...userData,
          past_opic_level: info.pastLevel,
          goal_opic_level: info.goalLevel,
          background: info.background,
          occupation_or_major: info.major,
          topics_of_interest: info.topics,
        });
      } else {
        console.error("사용자 정보 업데이트 실패:", response.message);
      }
    } catch (error) {
      console.error("사용자 정보 업데이트 실패:", error);
    }
  };

  return (
    <div className="flex flex-row">
      <SideBar />
      <div className="flex flex-col w-full h-screen bg-white px-12 mt-10 select-none">
        {userData?.topics_of_interest ? (
          <HomeExistUser
            userName={userData.name}
            pastLevel={userData.past_opic_level}
            goalLevel={userData.goal_opic_level}
            testDate={testDate}
            surveyList={[
              userData.background,
              userData.occupation_or_major,
              userData.topics_of_interest,
            ]}
            onEdit={() => console.log("Edit User Info")}
          />
        ) : (
          <HomeNewUser
            userName={userData?.name || ""}
            testDate={testDate}
            onComplete={handleOnboardingComplete}
          />
        )}
      </div>
    </div>
  );
};

export default Home;
