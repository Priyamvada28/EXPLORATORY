import React, { useState, useEffect } from "react";

const Projects = ({ email }) => {
    const [projectName, setProjectName] = useState("");
    const [program, setProgram] = useState("");
    const [message, setMessage] = useState("");
    const [projects, setProjects] = useState([]); // Store list of projects
    const [selectedProject, setSelectedProject] = useState(""); // For deletion dropdown

    // Fetch projects from backend
    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/projects/")
            .then((res) => res.json())
            .then((data) => setProjects(data))
            .catch(() => setMessage("Failed to load projects."));
    }, []);

    const handleAddProject = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://127.0.0.1:8000/api/add_project/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    project_name: projectName,
                    program: program,
                }),
            });

            const data = await response.json();
            setMessage(data.message || data.error);

            if (response.ok) {
                setProjects([...projects, { project_name: projectName, program }]); // Update UI
                setProjectName("");
                setProgram("");
            }
        } catch (error) {
            setMessage("Error submitting project. Try again later.");
        }
    };

    const handleDeleteProject = async () => {
        if (!selectedProject) {
            setMessage("Please select a project to delete.");
            return;
        }

        try {
            const response = await fetch("http://127.0.0.1:8000/api/delete_project/", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    project_name: selectedProject,
                }),
            });

            const data = await response.json();
            setMessage(data.message || data.error);

            if (response.ok) {
                setProjects((prevProjects) => prevProjects.filter(p => p.project_name !== selectedProject));
                setSelectedProject(""); // Reset dropdown
            }
        } catch (error) {
            setMessage("Error deleting project. Try again later.");
        }
    };

    return (
        <div>
            <h2>Manage Projects</h2>
            {message && <p>{message}</p>}
            
            {/* Add Project Form */}
            <form onSubmit={handleAddProject}>
                <input
                    type="text"
                    placeholder="Project Name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Program (e.g., 2nd, 3rd, 4th, MTech, PhD)"
                    value={program}
                    onChange={(e) => setProgram(e.target.value)}
                    required
                />
                <button type="submit">Add Project</button>
            </form>

            {/* Delete Project Dropdown */}
            <h3>Delete a Project</h3>
            <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}>
                <option value="">Select a project</option>
                {projects.map((proj) => (
                    <option key={proj.project_name} value={proj.project_name}>
                        {proj.project_name} ({proj.program})
                    </option>
                ))}
            </select>
            <button onClick={handleDeleteProject} disabled={!selectedProject}>Delete Project</button>
        </div>
    );
};

export default Projects;
