import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Learn from "./pages/Learn";
import Test from "./pages/Test";
import TestStart from "./pages/TestStart";
import Information from "./pages/Information";
import StudyMaterials from "./pages/StudyMaterials";
import Fillers from "./pages/Fillers";
import Edit from "./pages/Edit";

import { useEffect } from "react";
import { useRecoilState } from "recoil";
import { userPkState } from "./api/authAtoms";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("isLoggedIn")
  );
  const [userPk, setUserPk] = useRecoilState(userPkState);

  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem("isLoggedIn", "true");
    } else {
      localStorage.removeItem("isLoggedIn");
    }
  }, [isLoggedIn]);

  return (
    <>
      <Router>
        <Routes>
          <Route
            path="/"
            element={isLoggedIn ? <Home /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/login"
            element={<Login setIsLoggedIn={setIsLoggedIn} />}
          />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/information"
            element={
              isLoggedIn ? <Information /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/learn"
            element={isLoggedIn ? <Learn /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/learn/studymaterials"
            element={
              isLoggedIn ? <StudyMaterials /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/learn/fillers"
            element={
              isLoggedIn ? <Fillers /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/test"
            element={isLoggedIn ? <Test /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/test/teststart"
            element={
              isLoggedIn ? <TestStart /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/edit"
            element={isLoggedIn ? <Edit /> : <Navigate to="/login" replace />}
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
