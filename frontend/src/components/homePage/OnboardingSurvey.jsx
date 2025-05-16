import { useState } from "react";
import SurveyStep from "./SurveyStep";
import { useNavigate } from "react-router-dom";
import OnboardingMessage from "./OnboardingMessage";
import OnboardingButton from "./OnboardingButton";

const steps = [
  {
    title: "1. What’s your past OPIc level?",
    options: [
      "AL",
      "IH",
      "IM",
      "IL",
      "Or below",
      "No experience taking the test",
    ],
    multiple: false,
  },
  {
    title: "2. What’s your goal level?",
    options: ["AL", "IH", "IM", "IL", "Or below"],
    multiple: false,
  },
  {
    title: "3. Choose your background.",
    options: [
      "Student",
      "Office Worker",
      "Freelancer",
      "Self Employed",
      "Unemployed",
    ],
    multiple: false,
  },
  {
    title: "4. What is your occupation or major?",
    options: [
      "Computer Science",
      "Business Administration",
      "Marketing",
      "Visual Design",
      "Physical Education",
    ],
    multiple: false,
  },
  {
    title: "5. Select 2-3 topics of interest.",
    options: ["Shopping", "Movie", "Music", "Sports", "Reading books"],
    multiple: true,
  },
];

const OnboardingSurvey = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([
    null,
    null,
    null,
    null,
    [], // 마지막은 배열(다중선택)
  ]);

  // 선택 핸들러
  const handleSelect = (option) => {
    const newAnswers = [...answers];
    if (steps[step].multiple) {
      // 다중 선택
      let selected = newAnswers[step] || [];
      if (selected.includes(option)) {
        selected = selected.filter((item) => item !== option);
      } else if (selected.length < 3) {
        selected = [...selected, option];
      }
      newAnswers[step] = selected;
    } else {
      newAnswers[step] = option;
    }
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (step < steps.length - 1) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  // 마지막 저장
  const handleSave = () => {
    if (onComplete) onComplete(answers);
  };

  // 버튼 활성화 조건
  const isLastStep = step === steps.length - 1;
  const currentAnswer = answers[step];
  const canProceed = steps[step].multiple
    ? Array.isArray(currentAnswer) &&
      currentAnswer.length >= 2 &&
      currentAnswer.length <= 3
    : !!currentAnswer;

  return (
    <div className="bg-white rounded-xl shadow p-12 flex flex-col justify-between">
      <div>
        <SurveyStep
          title={steps[step].title}
          options={steps[step].options}
          selected={answers[step]}
          onSelect={handleSelect}
          multiple={steps[step].multiple}
        />
      </div>
      <div className="flex justify-between mt-12">
        {step > 0 ? (
          <button
            className="bg-primary text-white px-6 py-2 rounded-lg font-medium text-base hover:bg-blue-600 transition"
            onClick={handlePrev}
          >
            PREVIOUS
          </button>
        ) : (
          <div />
        )}
        {isLastStep ? (
          <button
            className={`bg-primary text-white px-8 py-2 rounded-lg font-medium text-base hover:bg-blue-600 transition ${
              !canProceed ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handleSave}
            disabled={!canProceed}
          >
            SAVE
          </button>
        ) : (
          <button
            className={`bg-primary text-white px-8 py-2 rounded-lg font-medium text-base hover:bg-blue-600 transition ${
              !canProceed ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handleNext}
            disabled={!canProceed}
          >
            NEXT
          </button>
        )}
      </div>
    </div>
  );
};

export default OnboardingSurvey;
