import SideBar from "../components/sidebar";
import HomeExistUser from "../components/homePage/HomeExistUser";
import HomeNewUser from "../components/homePage/HomeNewUser";

import { useRecoilState } from "recoil";
import { userDataState } from "../api/atom.js";

// const surveyList = [
//   "Student",
//   "Major in CS",
//   "Music / Movie / Shopping",
//   "Occasionally use English",
//   "Have been abroad for travel",
//   "Taking test for graduation requirement",
// ];

const Home = () => {
  const [userData, setUserData] = useRecoilState(userDataState);
  const userName = "Gildong Hong";

  // 온보딩 완료 처리 함수
  const handleOnboardingComplete = (surveyAnswers) => {
    // 실제로는 API 호출 후 응답 데이터 저장
    setUserData({
      userName,
      pastLevel: "Intermediate",
      goalLevel: "Advanced",
      testDate: "2025-8-15",
      surveyList: Array.isArray(surveyAnswers) ? surveyAnswers : [],
    });
  };

  return (
    <div className="flex flex-row">
      <SideBar userName={userName} />
      <div className="flex flex-col w-full h-screen bg-white px-12 mt-10">
        {userData ? (
          <HomeExistUser
            userName={userData.userName}
            pastLevel={userData.pastLevel}
            goalLevel={userData.goalLevel}
            testDate={userData.testDate}
            surveyList={userData.surveyList}
            onEdit={() => console.log("Edit User Info")}
          />
        ) : (
          <HomeNewUser onComplete={handleOnboardingComplete} />
        )}
      </div>
    </div>
  );
};

export default Home;
