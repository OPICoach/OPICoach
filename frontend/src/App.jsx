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
import TestResult from "./pages/TestResult";
import TestFeedback from "./pages/TestFeedback";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/information" element={<Information />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/learn/studymaterials" element={<StudyMaterials />} />
          <Route path="/learn/fillers" element={<Fillers />} />
          <Route path="/test" element={<Test />} />
          <Route path="/test/start" element={<TestStart />} />
          <Route path="/test/result" element={<TestResult />} />
          <Route path="/test/feedback" element={<TestFeedback />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
