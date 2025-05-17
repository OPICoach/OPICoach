const MessageButton = ({ icon, onClick, disabled }) => {
  

  return (
    <button
      className="bg-primary text-white px-5 py-2 rounded-full"
      onClick={onClick}
      disabled={disabled}
    >
      {icon}
    </button>
  );
};

export default MessageButton;
