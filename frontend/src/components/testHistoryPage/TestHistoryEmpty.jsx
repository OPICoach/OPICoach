import { Navigate } from "react-router-dom";

const TestHistoryEmpty = () => {
  const nav = Navigate();

  return (
    <div className="flex flex-col items-center justify-center h-full py-20">
      <div className="max-w-md text-center">
        <h3 className="text-xl font-semibold mb-2">No Test History Yet</h3>
        <p className="text-gray-600 mb-6 whitespace-pre-line">
          Your test history will appear here once you take a test. Start a test
          now!
        </p>
        <button
          onClick={() => nav("/test")}
          className="bg-primary hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg"
        >
          Start Test
        </button>
      </div>
    </div>
  );
};

export default TestHistoryEmpty;
