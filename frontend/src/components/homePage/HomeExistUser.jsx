import WelcomeMessage from "./WelcomeMessage";
import LevelInfo from "./LevelInfo";
import TestDateInfo from "./TestDateInfo";
import SurveyResponse from "./SurveyResponse";
import EditUserInfoButton from "./EditUserInfoButton";
import { useNavigate } from "react-router-dom";

const HomeExistUser = ({
  userName,
  pastLevel,
  goalLevel,
  testDate,
  surveyList,
}) => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col bg-white px-12 pt-10 cursor-default">
      <WelcomeMessage userName={userName} />
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <LevelInfo pastLevel={pastLevel} goalLevel={goalLevel} />
          <TestDateInfo testDate={testDate} />
        </div>
        <SurveyResponse surveyList={surveyList} />
      </div>
      <div className="mt-12 flex justify-end">
        <EditUserInfoButton onClick={() => navigate("/edit")} />
      </div>
    </div>
  );
};

export default HomeExistUser;
