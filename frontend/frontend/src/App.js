import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css'; // Import CSS
import Login from './components/Login';
import Signup from './components/Signup';
import Lab from './components/Lab';
import Profile from './components/Profile';
import ApplicationForm from './components/ApplicationForm';
import Results from './components/Results';
import SubmitProject from './components/SubmitProject';
import Projects from './components/Projects';
import Requests from './components/Requests';
import MeetingScheduler from './components/MeetingScheduler'; // Import the new component
import ProfessorMeetingSetter from './components/ProfessorMeetingSetter'; // Import the new component

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  const handleLogin = (user) => {
    setIsLoggedIn(true);
    setUserData(user);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<Signup />} />

        {/* Navigation Blocks */}
        <Route
          path="/dashboard"
          element={
            isLoggedIn ? (
              <div className="container">
                <Link to="/lab" className="block">Lab</Link>
                <Link to="/profile" className="block">Profile</Link>
                <Link to="/meeting-scheduler" className="block">Meeting Scheduler</Link>
                <Link to="/meeting-setter" className="block">Meeting Setter</Link>


                {userData?.status !== 'Professor' && (
                  <Link to={`/application-form?email=${userData.email}`} className="block">Application Form</Link>
                )}
                <Link to="/results" className="block">Results</Link>
                {userData?.status !== 'Professor' && (
                  <Link to="/submit-project" className="block">Submit Project</Link>
                )}

                <Link to="/projects" className="block">Projects</Link>
                {userData?.status === 'Professor' && (
                  <Link to="/requests" className="block">Requests</Link>
                )}

                
              </div>
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route path="/lab" element={isLoggedIn ? <Lab userData={userData} /> : <Login onLogin={handleLogin} />} />
        <Route path="/profile" element={isLoggedIn ? <Profile email={userData?.email} /> : <Login onLogin={handleLogin} />} />
        <Route path="/application-form" element={isLoggedIn && userData?.status !== 'Professor' ? <ApplicationForm /> : <Login onLogin={handleLogin} />} />

        <Route path="/results" element={isLoggedIn ? <Results email={userData?.email} /> : <Login onLogin={handleLogin} />} />
        <Route path="/submit-project" element={isLoggedIn ? <SubmitProject email={userData?.email} /> : <Login onLogin={handleLogin} />} />
        <Route path="/projects" element={isLoggedIn ? <Projects email={userData?.email} /> : <Login onLogin={handleLogin} />} />
        
        <Route
        path="/submit-project"
        element={isLoggedIn ? <SubmitProject email={userData?.email} /> : <Login onLogin={handleLogin} />}
        />

        <Route path="/requests" element={isLoggedIn ? <Requests userData={userData} /> : <Login onLogin={handleLogin} />} />
        <Route path="/meeting-scheduler" element={isLoggedIn ? <MeetingScheduler email={userData?.email} /> : <Login onLogin={handleLogin} />} />
        <Route path="/meeting-setter" element={isLoggedIn ? <ProfessorMeetingSetter email={userData?.email} /> : <Login onLogin={handleLogin} />} />

        <Route path="*" element={<h1 className="not-found">Page Not Found</h1>} />
      </Routes>
    </Router>
  );
};

export default App;