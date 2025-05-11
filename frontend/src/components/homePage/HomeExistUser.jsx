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
  onEdit,
}) => {
  return (
    <div className="flex flex-col w-full min-h-screen bg-white px-10 pt-16">
      <WelcomeMessage userName={userName} />
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <LevelInfo pastLevel={pastLevel} goalLevel={goalLevel} />
          <TestDateInfo testDate={testDate} />
        </div>
        <SurveyResponse surveyList={surveyList} />
      </div>
      <div className="mt-12 flex justify-end">
        <EditUserInfoButton onEdit={onEdit} />
      </div>
    </div>
  );
};

export default HomeExistUser;
