const OnboardingButton = ({ name, onClick }) => (
  <button
    className="bg-primary hover:bg-blue-600 transition text-white px-6 py-2 rounded-lg text-base font-medium"
    onClick={onClick}
  >
    {name}
  </button>
);

export default OnboardingButton;
