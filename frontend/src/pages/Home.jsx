import SideBar from "../components/SideBar.jsx";
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
  const testDate = "2025-8-15"; // 예시

  const handleOnboardingComplete = (info) => {
    setUserData(info); // info는 HomeNewUser에서 전달한 객체
  };

  return (
    <div className="flex flex-row">
      <SideBar userName={userName} />
      <div className="flex flex-col w-full h-screen bg-white px-12 mt-10 select-none">
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
          <HomeNewUser
            userName={userName}
            testDate={testDate}
            onComplete={handleOnboardingComplete}
          />
        )}
      </div>
    </div>
  );
};

export default Home;
