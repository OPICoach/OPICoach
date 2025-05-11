const EditUserInfoButton = ({ onEdit }) => (
  <button
    className="bg-primary hover:bg-blue-600 transition text-white px-6 py-2 rounded-lg text-base font-semibold"
    onClick={onEdit}
  >
    Edit User Information
  </button>
);

export default EditUserInfoButton;