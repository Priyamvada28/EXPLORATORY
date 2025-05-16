import React, { useState, useEffect } from "react";
import axios from "axios";
// import "./MeetingScheduler.css"; // Optional for styling

const MeetingScheduler = ({ email }) => {
  const [isStudent, setIsStudent] = useState(false);
  const [unmarkedProjects, setUnmarkedProjects] = useState([]);
  const [finalMeetingTimes, setFinalMeetingTimes] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [meetingTime, setMeetingTime] = useState("");

  useEffect(() => {
    console.log("📧 Email received in MeetingScheduler:", email); // ✅ DEBUG LINE
    if (!email) return;
    const fetchData = async () => {
      try {
        // Corrected the URLs
        const [unmarkedResponse, finalResponse] = await Promise.all([
          axios.get(`http://localhost:8000/api/student/${email}/unmarked-projects/`),
          axios.get(`http://localhost:8000/api/student/${email}/final-meeting-time/`)
        ]);

        setUnmarkedProjects(unmarkedResponse.data);
        setFinalMeetingTimes(finalResponse.data);
        setIsStudent(true); // ✅ if both APIs work, treat user as student
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsStudent(false); // ❌ not authorized or something failed
      }
    };

    fetchData();
  }, [email]);

  const handleSetTime = async () => {
    if (!selectedProjectId || !meetingTime) {
      alert("Please select a project and a valid meeting time.");
      return;
    }

    try {
        await axios.post(`http://localhost:8000/api/student/${email}/unmarked-projects/`, {
          project_id: selectedProjectId,
          meeting_time: meetingTime,
        });

      alert("✅ Meeting time set successfully!");

      // Optionally refresh data
      setMeetingTime("");
      setSelectedProjectId("");
    } catch (error) {
      console.error("Error setting meeting time:", error.response?.data || error);
      alert(`❌ Failed to set meeting time: ${error.response?.data?.error || error.message}`);

    }
  };

  if (!isStudent) {
    return <h2>Access Denied: You are not a Student</h2>;
  }

  return (
    <div className="meeting-scheduler-container">
      <h2>📅 Schedule Your Project Meeting</h2>

      <div className="form-group">
        <label>Select Project:</label>
        <select
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
        >
          <option value="">-- Choose Project --</option>
          {unmarkedProjects.map((proj) => (
            <option key={proj.pid} value={proj.pid}>
              {proj.project_name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
  <label>Set Meeting Day:</label>
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

      <button onClick={handleSetTime}>✅ Confirm Meeting</button>

      <div className="meeting-times">
        <h3>📌 Final Meeting Times</h3>
        {finalMeetingTimes.length === 0 ? (
          <p>No final meeting times yet.</p>
        ) : (
          <ul>
            {finalMeetingTimes.map((item, index) => (
              <li key={index}>
                <strong>{item.project_name}</strong>: {item.final_meeting_time}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MeetingScheduler;
