const SurveyResponse = ({ surveyList }) => (
  <div className="bg-white rounded-xl shadow-md p-6">
    <div className="text-lg text-gray-700 font-medium mb-2">Survey Response</div>
    <ul className="list-disc ml-6 text-gray-800 space-y-1">
      {surveyList.map((item, idx) => (
        <li key={idx} className="leading-relaxed">{item}</li>
      ))}
    </ul>
  </div>
);

export default SurveyResponse;