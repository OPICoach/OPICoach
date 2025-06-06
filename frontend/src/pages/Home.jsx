import SideBar from "../components/sideBar/SideBar.jsx";
import HomeExistUser from "../components/homePage/HomeExistUser";
import HomeNewUser from "../components/homePage/HomeNewUser";
import { useRecoilState } from "recoil";
import { userInfoState, userPkState } from "../atom/authAtoms.js";
import { updateUserInfoAPI, fetchUserInfo } from "../api/api";
import { sideBarState, surveyState } from "../atom/sidebarAtom";
import { useEffect } from "react";

const Home = () => {
  const [userData, setUserData] = useRecoilState(userInfoState);
  const [userPk, setUserPK] = useRecoilState(userPkState);
  const [open] = useRecoilState(sideBarState);
  const [survey, setSurvey] = useRecoilState(surveyState);

  const handleOnboardingComplete = async (info) => {
    try {
      const userDataToSend = {
        user_pk: userPk,
        past_opic_level: info.pastLevel,
        goal_opic_level: info.goalLevel,
        background: info.background,
        occupation_or_major: info.major,
        topics_of_interest: info.topics,
      };

      console.log("Sending user data:", userDataToSend); // 데이터 확인용 로그

      // 백엔드 API 호출하여 사용자 정보 업데이트
      const response = await updateUserInfoAPI(userDataToSend);

      if (response.status === "success") {
        // 로컬 상태 업데이트
        setUserData({
          ...userDataToSend,
          name: userData.name, // 기존 이름 유지
          level_history: [
            {
              level: info.pastLevel,
              score: 0,
              date: new Date().toISOString(),
            },
          ],
        });
        setSurvey(false); // 온보딩 설문 종료
      } else {
        console.error("사용자 정보 업데이트 실패:", response.message);
      }
    } catch (error) {
      console.error("사용자 정보 업데이트 실패:", error);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetchUserInfo(userPk);
        console.log("User data from API:", response); // 디버그 로그 추가
        if (response.status === "success") {
          setUserData(response.user);
          console.log("Set user data:", response.user); // 디버그 로그 추가
          console.log("Level history:", response.user.level_history); // level_history 확인
        } else {
          console.error("Failed to fetch user data:", response.message);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (userPk) {
      // userPk가 있을 때만 API 호출
      fetchUserData();
    }
  }, [userPk]); // userPk가 변경될 때마다 실행

  useEffect(() => {
    console.log("survey 상태 변경됨:", survey);
  }, [survey]);


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
        {userData?.topics_of_interest ? (
          <HomeExistUser
            userName={userData.name}
            pastLevel={userData.past_opic_level}
            goalLevel={userData.goal_opic_level}
            surveyList={[
              userData.background,
              userData.occupation_or_major,
              userData.topics_of_interest,
            ]}
            levelHistory={userData.level_history || []}
            progress={userData.progress}
            onEdit={() => console.log("Edit User Info")}
          />
        ) : (
          <HomeNewUser
            userName={userData?.name || ""}
            onComplete={handleOnboardingComplete}
          />
        )}
      </div>
    </div>
  );
};

export default Home;
