import React, { useEffect, useState } from "react";

const SubmitProject = ({ email }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!email) return;

    fetch(`http://127.0.0.1:8000/api/get_assigned_projects/?email=${email}`)
      .then(async (response) => response.json())
      .then((data) => {
        setProjects(data.assigned_projects || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching projects:", error);
        setLoading(false);
      });
  }, [email]);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedProject || !file) {
      alert("Please select a project and upload a file.");
      return;
    }

    const formData = new FormData();
    formData.append("student_email", email);
    formData.append("assigned_project", selectedProject.pid);
    formData.append("project_name", selectedProject.project_name);
    formData.append("professor_email", selectedProject.professor_email);
    formData.append("submission_date", new Date().toISOString().split("T")[0]); // Current date
    formData.append("file", file);

    setSubmitting(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/submit_project/", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("Project submitted successfully!");
        setFile(null);
        setSelectedProject(null);
      } else {
        alert("Failed to submit the project.");
      }
    } catch (error) {
      console.error("Error submitting project:", error);
    }

    setSubmitting(false);
  };

  return (
    <div>
      <h2>Assigned Projects</h2>
      {loading ? (
        <p>Loading...</p>
      ) : projects.length > 0 ? (
        <form onSubmit={handleSubmit}>
          <label>
            Select a Project:
            <select
              value={selectedProject?.pid || ""}
              onChange={(e) =>
                setSelectedProject(projects.find((p) => p.pid === parseInt(e.target.value)))
              }
            >
              <option value="">-- Select a project --</option>
              {projects.map((project) => (
                <option key={project.pid} value={project.pid}>
                  {project.project_name} (Deadline: {project.deadline_date})
                </option>
              ))}
            </select>
          </label>
          <br />

          <label>
            Upload File:
            <input type="file" onChange={handleFileChange} required />
          </label>
          <br />

          <button type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Project"}
          </button>
        </form>
      ) : (
        <p>No assigned projects.</p>
      )}
    </div>
  );
};

export default SubmitProject;
