import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LevelInfo = ({ pastLevel, goalLevel, progress }) => (
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
    <div className="mt-4">
      <div className="flex justify-between mb-2">
        <span className="font-semibold text-gray-900">Progress to Next Level</span>
        <span className="text-blue-500">{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-blue-500 h-2.5 rounded-full transition-all duration-500" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  </div>
);

export default LevelInfo;