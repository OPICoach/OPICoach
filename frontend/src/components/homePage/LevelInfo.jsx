const LevelInfo = ({ pastLevel, goalLevel }) => (
  <div className="bg-white rounded-xl shadow-md p-6">
    <div className="text-lg text-gray-700 font-medium mb-2">Level Information</div>
    <div className="flex flex-col gap-2">
      <span>
        <span className="font-semibold text-gray-900">Past Level</span>
        <span className="ml-2 text-blue-500">{pastLevel}</span>
      </span>
      <span>
        <span className="font-semibold text-gray-900">Goal Level</span>
        <span className="ml-2 text-green-500">{goalLevel}</span>
      </span>
    </div>
  </div>
);

export default LevelInfo;