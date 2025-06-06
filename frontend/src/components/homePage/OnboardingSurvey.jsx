import React, { useState, useEffect } from "react";
import SurveyStep from "./SurveyStep";
import { useNavigate, useLocation } from "react-router-dom";
import OnboardingMessage from "./OnboardingMessage";
import OnboardingButton from "./OnboardingButton";

const steps = [
  {
    title: "What's your past OPIc level?",
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
    title: "What's your goal level?",
    options: ["AL", "IH", "IM", "IL", "Or below"],
    multiple: false,
  },
  {
    title: "Choose your background.",
    options: [
      "student",
      "office worker",
      "freelancer",
      "part-time worker",
      "self employed",
      "unemployed",
    ],
    multiple: false,
  },
  {
    title: "What is your occupation or major?",
    options: [
      "computer science",
      "engineering",
      "natural science",
      "business administration",
      "marketing",
      "art",
      "physical education",
      "education",
      "music",
      "social science",
      "humanities",
      "other",
    ],
    multiple: false,
  },
  {
    title: "Select 2-3 topics of interest.",
    options: [
      "shopping",
      "movie",
      "music",
      "sports",
      "reading books",
      "travel",
      "cooking",
      "playing games",
      "going to cafes",
      "playing an instrument",
    ],
    multiple: true,
  },
];

const OnboardingSurvey = ({ onComplete, initialData = [] }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([null, null, null, null, []]);
  const location = useLocation();
  const isEditPage = location.pathname === "/edit";

  useEffect(() => {
    if (initialData.length > 0) {
      const processedData = [...initialData];
      if (!Array.isArray(processedData[4])) {
        processedData[4] = [];
      }
      setAnswers(processedData);
      if (isEditPage) {
        setStep(1);
      }
    }
  }, [initialData, isEditPage]);

  const handleSelect = (option) => {
    const newAnswers = [...answers];
    if (steps[step].multiple) {
      let selected = Array.isArray(newAnswers[step])
        ? [...newAnswers[step]]
        : [];
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
    if (step > 0) {
      // Edit 페이지에서는 past level(step 0)으로 돌아갈 수 없음
      if (isEditPage && step === 1) {
        return;
      }
      setStep(step - 1);
    }
  };

  // 저장
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
    <div className="bg-white rounded-xl shadow p-12 flex flex-col justify-between w-full">
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
          isEditPage && step === 1 ? (
            <button
              className="bg-gray-300 text-gray-500 px-6 py-2 rounded-lg font-medium text-base cursor-not-allowed"
              disabled
            >
              PREVIOUS
            </button>
          ) : (
            <button
              className="bg-primary text-white px-6 py-2 rounded-lg font-medium text-base hover:bg-blue-600 transition"
              onClick={handlePrev}
            >
              PREVIOUS
            </button>
          )
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
