import React from "react";

const SurveyStep = ({ title, options, selected, onSelect, multiple }) => {
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <div className="space-y-2">
        {options.map((option) => (
          <label key={option} className="flex items-center">
            <input
              type={multiple ? "checkbox" : "radio"}
              checked={multiple ? selected?.includes(option) : selected === option}
              onChange={() => onSelect(option)}
              className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                multiple ? "" : "rounded-full"
              }`}
            />
            <span className="ml-2 text-sm text-gray-700">
              {option === "reading books" ? "독서" : 
               option === "movie" ? "영화" :
               option === "music" ? "음악" :
               option === "sports" ? "스포츠" :
               option === "shopping" ? "쇼핑" : option}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default SurveyStep; 