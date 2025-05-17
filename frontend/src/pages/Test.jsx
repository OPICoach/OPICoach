import SideBar from "../components/SideBar.jsx";
import { useNavigate } from "react-router-dom";

const TestStart = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-row">
      <SideBar userName="Gildong Hong" />
      <div className="flex flex-col justify-center items-center w-full h-screen bg-white">
        <div className="flex gap-8">
          <button
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-600"
            onClick={() => navigate('/test/teststart')}
          >
            Full
          </button>
          <button className="bg-gray-300 text-black px-6 py-3 rounded-lg hover:bg-gray-400">
            Mock
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestStart;
