import OnboardingMessage from "./OnboardingMessage";
import OnboardingSurvey from "./OnboardingSurvey";
import { useState } from "react";

const HomeNewUser = ({ userName, testDate, onComplete }) => {
  const handleSurveyComplete = (answers) => {
    const [pastLevel, goalLevel, background, major, topics] = answers;
    const surveyList = [background, major, topics];

    // HomeExistUser와 동일한 구조로 콜백
    onComplete({
      userName,
      pastLevel,
      goalLevel,
      testDate,
      surveyList,
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
