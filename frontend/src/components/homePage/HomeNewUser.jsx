import OnboardingMessage from "./OnboardingMessage";
import OnboardingSurvey from "./OnboardingSurvey";

const HomeNewUser = ({ userName, testDate, onComplete }) => {

  const handleSurveyComplete = (answers) => {
    const [pastLevel, goalLevel, background, major, topics] = answers;

    onComplete({
      pastLevel,
      goalLevel,
      background,
      major,
      topics,
    });
  };

  return (
    <div className="flex flex-col bg-white px-12 pt-16 cursor-default">
      <OnboardingMessage />
      <div className="flex mt-10">
        <OnboardingSurvey onComplete={handleSurveyComplete} />
      </div>
    </div>
  );
};

export default HomeNewUser;
