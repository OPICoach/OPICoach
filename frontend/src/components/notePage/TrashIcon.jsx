const TrashIcon = ({ className, onClick }) => (
  <svg
    onClick={onClick}
    className={`w-5 h-5 text-gray-400 hover:text-red-500 transition cursor-pointer ${className}`}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M3 6h18M9 6V4a2 2 0 012-2h2a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
  </svg>
);

export default TrashIcon;
