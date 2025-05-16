import React, { useState, useEffect } from "react";
import axios from "axios";

const ProfessorMeetingSetter = ({ email }) => {
  const [isProfessor, setIsProfessor] = useState(false);
  const [assignedProjects, setAssignedProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [meetingTime, setMeetingTime] = useState("");

  useEffect(() => {
    console.log("📧 Email received in ProfessorMeetingSetter:", email);
    if (!email) return;

    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/professor/${email}/assigned-projects/`
        );
        setAssignedProjects(response.data);
        setIsProfessor(true);
      } catch (error) {
        console.error("Error fetching professor projects:", error);
        setIsProfessor(false);
      }
    };

    fetchData();
  }, [email]);

  const handleSetFinalMeeting = async () => {
    if (!selectedProjectId || !meetingTime) {
      alert("Please select a project and meeting time.");
      return;
    }

    const selectedProject = assignedProjects.find(
      (p) => String(p.pid) === String(selectedProjectId)
    //   (p) => p.pid === selectedProjectId
    );

    if (!selectedProject) {
      alert("Selected project not found.");
      return;
    }

    try {
      await axios.post(`http://localhost:8000/api/professor/set-meeting-time/`, {
        professor_email: email,
        project_name: selectedProject.project_name,
        final_meeting_time: meetingTime,
      });

      alert("✅ Final meeting time set!");
      setSelectedProjectId("");
      setMeetingTime("");
    } catch (error) {
      console.error("Error setting final meeting:", error.response?.data || error);
      alert(`❌ Failed: ${error.response?.data?.error || error.message}`);
    }
  };

  if (!isProfessor) {
    return <h2>Access Denied: You are not a Professor</h2>;
  }

  return (
    <div className="meeting-scheduler-container">
      <h2>📅 Set Final Project Meeting (Professor)</h2>

      <h3>📝 Assigned Projects & Student Preferences</h3>
      <ul>
        {assignedProjects.map((proj) => (
          <li key={proj.pid}>
            <strong>{proj.project_name}</strong> by {proj.student_name} ({proj.student_email})<br />
            Preferred Day: <em>{proj.preferred_meeting_time || "Not Given"}</em><br />
            Finalized: <strong>{proj.final_meeting_time || "Not Set"}</strong>
          </li>
        ))}
      </ul>

      <hr />

      <div className="form-group">
        <label>Select Project:</label>
        <select
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
        >
          <option value="">-- Choose Project --</option>
          {assignedProjects.map((proj) => (
            <option key={proj.pid} value={proj.pid}>
              {proj.project_name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Set Final Meeting Day:</label>
        <select
          value={meetingTime}
          onChange={(e) => setMeetingTime(e.target.value)}
        >
          <option value="">-- Choose Day --</option>
          <option value="MON">Monday</option>
          <option value="TUE">Tuesday</option>
          <option value="WED">Wednesday</option>
          <option value="THU">Thursday</option>
          <option value="FRI">Friday</option>
        </select>
      </div>

      <button onClick={handleSetFinalMeeting}>✅ Set Final Meeting</button>
    </div>
  );
};

export default ProfessorMeetingSetter;
