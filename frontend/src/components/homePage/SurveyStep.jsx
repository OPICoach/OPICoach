const SurveyStep = ({ title, options, selected, onSelect, multiple }) => (
  <div>
    <div className="text-xl font-normal text-gray-900 mb-8">{title}</div>
    <ul className="space-y-5">
      {options.map((opt, idx) => (
        <li key={opt} className="flex items-center">
          <input
            type={multiple ? "checkbox" : "radio"}
            checked={
              multiple
                ? Array.isArray(selected) && selected.includes(opt)
                : selected === opt
            }
            onChange={() => onSelect(opt)}
            className="w-5 h-5 accent-[#4490FB] rounded mr-4"
            id={`opt-${idx}`}
          />
          <label
            htmlFor={`opt-${idx}`}
            className="text-gray-800 text-lg cursor-pointer select-none"
          >
            {opt}
          </label>
        </li>
      ))}
    </ul>
  </div>
);

export default SurveyStep;
