import SideBar from "../components/SideBar.jsx";
import MessageInput from "../components/chatPage/MessageInput.jsx";
import MessageList from "../components/chatPage/MessageList.jsx";
import BackButton from "../components/BackButton.jsx";

const Fillers = () => {
  return (
    <div className="flex flex-row h-screen bg-white">
      <SideBar userName="Gildong Hong" />
      <div className="flex flex-col flex-1 px-10 pt-4 pb-8 h-full">
        <BackButton />
        <MessageList />
        <MessageInput />
      </div>
    </div>
  );
};

export default Fillers;
