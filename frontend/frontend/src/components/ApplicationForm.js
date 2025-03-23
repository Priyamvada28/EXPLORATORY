import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const ApplicationForm = () => {
  const [studentData, setStudentData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedProfessor, setSelectedProfessor] = useState("");
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const userEmail = queryParams.get("email");

  useEffect(() => {
    if (!userEmail) {
      console.error("Error: userEmail is undefined in URL!");
      return;
    }

    axios
      .get(`http://localhost:8000/api/student/${userEmail}/`)
      .then((response) => {
        setStudentData(response.data);
        setProjects(response.data.projects || []);
        setProfessors(response.data.professors || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching student data:", error);
        setLoading(false);
      });
  }, [userEmail]);

  const handleSubmit = () => {
    if (!selectedProject || !selectedProfessor) {
      alert("Please select both a project and a professor.");
      return;
    }

    const applicationData = {
      student_email: studentData.email,
      professor_email: selectedProfessor,
      project_name: selectedProject,
    };

    axios
      .post("http://localhost:8000/api/submit-application/", applicationData)
      .then((response) => {
        alert("Application submitted successfully!");
      })
      .catch((error) => {
        console.error("Error submitting application:", error.response ? error.response.data : error.message);
        alert("Failed to submit application.");
        // console.error("Error submitting application:", error);
        // alert("Failed to submit application.");
      });
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ backgroundColor: "#282c34", color: "white", padding: "20px", borderRadius: "8px" }}>
      <h2 style={{ textAlign: "center", fontSize: "24px", fontWeight: "bold", color: "white" }}>Student Details</h2>
      <p style={{ color: "white", fontWeight: "bold" }}><strong>Name:</strong> {studentData?.name}</p>
      <p style={{ color: "white", fontWeight: "bold" }}><strong>Email:</strong> {studentData?.email}</p>
      <p style={{ color: "white", fontWeight: "bold" }}><strong>Year:</strong> {studentData?.year}</p>

      <h3>Projects</h3>
      <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}>
        <option value="">Select a project</option>
        {projects.map((project, index) => (
          <option key={index} value={project}>{project}</option>
        ))}
      </select>

      <h3>Professors</h3>
      <select value={selectedProfessor} onChange={(e) => setSelectedProfessor(e.target.value)}>
        <option value="">Select a professor</option>
        {professors.map((professor, index) => (
          <option key={index} value={professor}>{professor}</option>
        ))}
      </select>

      <button onClick={handleSubmit} style={{ marginTop: "15px", padding: "10px", backgroundColor: "#61dafb", border: "none", borderRadius: "5px", cursor: "pointer" }}>Submit Application</button>
    </div>
  );
};

export default ApplicationForm;