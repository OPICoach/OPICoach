import { useNavigate } from "react-router-dom";
import backButtonIcon from "../assets/back_button.svg";

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-start mb-6">
      <button onClick={() => navigate(-1)}>
        <img src={backButtonIcon} alt="뒤로가기" className="w-[9px]" />
      </button>
    </div>
  );
};

export default BackButton;
