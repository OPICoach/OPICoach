import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet
} from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Learn from "./pages/Learn";
import Test from "./pages/Test";
import TestStart from "./pages/TestStart";
import TestFeedback from "./pages/TestFeedback";
import Note from "./pages/Note";
import Edit from "./pages/Edit";
import ExamHistory from "./pages/ExamHistory";
import VocabPage from "./pages/VocabPage";
import VocabStudyPage from "./pages/VocabStudyPage";

import { useEffect } from "react";
import { useRecoilState } from "recoil";
import { userPkState } from "./atom/authAtoms";
import { sideBarState } from "./atom/sidebarAtom";

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
            path="/note"
            element={isLoggedIn ? <Note /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/learn/session/:session_id"
            element={isLoggedIn ? <Learn /> : <Navigate to="/login" replace />}
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
            path="/testfeedback"
            element={
              isLoggedIn ? <TestFeedback /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/edit"
            element={isLoggedIn ? <Edit /> : <Navigate to="/login" replace />}
          />
          <Route path="/exam/history" element={<ExamHistory />} />
          <Route
            path="/vocab"
            element={isLoggedIn ? <VocabPage /> : <Navigate to="/login" replace />}
          />
          <Route path="/vocab/study" element={<VocabStudyPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
