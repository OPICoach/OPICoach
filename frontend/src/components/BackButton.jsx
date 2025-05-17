import { useNavigate } from "react-router-dom";

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-start px-10 pt-3">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-black hover:underline font-medium"
      >
        <span className="text-[22px] font-medium mr-1">&lt;</span>
      </button>
    </div>
  );
};

export default BackButton;
