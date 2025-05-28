import { useState } from "react";

const LoginRegisterInput = ({
  placeholder,
  type = "text",
  showToggle = false,
  value,
  onChange
}) => {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="w-full relative select-none">
      <input
        type={isPassword && !visible ? "password" : "text"}
        placeholder={placeholder}
        className="px-4 py-3 rounded-md bg-opiLightGray text-gray-600 w-full focus:outline-none pr-10 placeholder-opiGray"
        value={value}
        onChange={onChange}
      />
      {showToggle && isPassword && (
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-opiGray cursor-pointer"
          tabIndex={-1}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12s-3.75 6.75-9.75 6.75S2.25 12 2.25 12z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default LoginRegisterInput;
