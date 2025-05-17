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
      // 아래는 예시! 실제로는 answers 구조에 맞게 매핑 필요
      pastLevel: answers[0],
      goalLevel: answers[1],
      background: answers[2],
      major: answers[3],
      surveyList: answers[4],
    });
    navigate("/"); // 홈으로 이동
  };

  // 기존 정보로 초기값 세팅 (OnboardingSurvey에 prop으로 전달)
  const initialAnswers = [
    userData?.pastLevel || null,
    userData?.goalLevel || null,
    userData?.background || null,
    userData?.major || null,
    Array.isArray(userData?.surveyList) ? userData.surveyList : [],
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
