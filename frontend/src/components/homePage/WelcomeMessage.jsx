const WelcomeMessage = ({ userName }) => (
  <h1 className="text-4xl font-semibold text-gray-900 tracking-tight">
    Welcome back, <span className="text-blue-600">{userName}</span>.
  </h1>
);

export default WelcomeMessage;