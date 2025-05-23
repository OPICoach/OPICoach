import { useRecoilState } from "recoil";
import { userDataState } from "../api/atom";
import { useNavigate } from "react-router-dom";
import OnboardingSurvey from "../components/homePage/OnboardingSurvey";

const Edit = () => {
  const [userData, setUserData] = useRecoilState(userDataState);
  const navigate = useNavigate();

  // 저장 완료 시 userDataState 업데이트 및 홈으로 이동
  const handleEditComplete = (answers) => {
    setUserData({
      ...userData,
      pastLevel: answers[0],
      goalLevel: answers[1],
      background: answers[2],
      major: answers[3],
      surveyList: [answers[2], answers[3], answers[4]],
    });
    navigate("/"); // 홈으로 이동
  };

  const initialAnswers = [
    userData?.pastLevel || null,
    userData?.goalLevel || null,
    userData?.background || null,
    userData?.major || null,

    Array.isArray(userData?.surveyList) && userData.surveyList.length === 3
      ? userData.surveyList[2]
      : [],
  ];

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-8">Edit User Information</h2>
        <OnboardingSurvey
          onComplete={handleEditComplete}
          initialAnswers={initialAnswers}
        />
      </div>
    </div>
  );
};

export default Edit;
