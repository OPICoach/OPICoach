import WelcomeMessage from "./WelcomeMessage";
import LevelInfo from "./LevelInfo";
import TestDateInfo from "./TestDateInfo";
import SurveyResponse from "./SurveyResponse";
import EditUserInfoButton from "./EditUserInfoButton";

const HomeExistUser = ({
  userName,
  pastLevel,
  goalLevel,
  testDate,
  surveyList,

}) => {
  return (
    <div className="flex flex-col bg-white px-12 pt-16 cursor-default">
      <WelcomeMessage userName={userName} />
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <LevelInfo pastLevel={pastLevel} goalLevel={goalLevel} />
          <TestDateInfo testDate={testDate} />
        </div>
        <SurveyResponse surveyList={surveyList} />
      </div>
      <div className="mt-12 flex justify-end">
        <EditUserInfoButton name="NEXT" />
      </div>
    </div>
  );
};

export default HomeExistUser;
