import OnboardingMessage from "./OnboardingMessage";
import OnboardingSurvey from "./OnboardingSurvey";

const HomeNewUser = ({ onComplete }) => {
  return (
    <div className="flex flex-col w-[1000px] bg-white px-12 pt-16 cursor-default">
      <OnboardingMessage />
      <div className="flex mt-10">
        <OnboardingSurvey onComplete={onComplete} />
      </div>
    </div>
  );
};

export default HomeNewUser;
