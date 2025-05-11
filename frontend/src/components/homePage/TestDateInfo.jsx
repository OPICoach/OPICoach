const TestDateInfo = ({ testDate }) => (
  <div className="bg-white rounded-xl shadow-md p-6 mt-4">
    <div className="text-lg text-gray-700 font-medium mb-2">Scheduled Test Date</div>
    <div className="text-xl text-gray-900 font-semibold tracking-wide">{testDate}</div>
  </div>
);

export default TestDateInfo;