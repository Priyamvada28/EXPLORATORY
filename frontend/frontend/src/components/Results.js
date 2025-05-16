import React, { useEffect, useState } from "react";

const Results = () => {
    const [evaluations, setEvaluations] = useState([]);
    const [error, setError] = useState("");
    const [feedbacks, setFeedbacks] = useState({}); // Store feedback input for each project

    // Get professor's email from localStorage
    const professorEmail = localStorage.getItem("email");

    useEffect(() => {
        const fetchEvaluations = async () => {
            if (!professorEmail) {
                setError("Professor email not found.");
                return;
            }

            try {
                const response = await fetch(`http://127.0.0.1:8000/api/get_pending_evaluations/?email=${professorEmail}`);
                const data = await response.json();

                if (response.ok) {
                    if (data.pending_evaluations) {
                        setEvaluations(data.pending_evaluations);
                    } else {
                        setError("No results to be evaluated.");
                    }
                } else {
                    setError(data.error || "Failed to fetch data.");
                }
            } catch (error) {
                setError("Error fetching data. Please try again later.");
            }
        };

        fetchEvaluations();
    }, [professorEmail]);

    const handleFeedbackChange = (submissionId, value) => {
        setFeedbacks((prev) => ({
            ...prev,
            [submissionId]: value,
        }));
    };

    const handleSubmitFeedback = async (submissionId) => {
        const feedback = feedbacks[submissionId];

        if (!feedback) {
            alert("Please enter feedback before submitting.");
            return;
        }

        try {
            const response = await fetch("http://127.0.0.1:8000/api/submit_feedback/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    submission_id: submissionId,
                    feedback,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                alert("Feedback submitted successfully!");
                setEvaluations((prev) => prev.filter((proj) => proj.submission_id !== submissionId)); // Remove from list
            } else {
                alert(data.error || "Failed to submit feedback.");
            }
        } catch (error) {
            alert("Error submitting feedback. Please try again.");
        }
    };

    return (
        <div className="results-container">
            <h2>Pending Evaluations</h2>
            {error ? (
                <p>{error}</p>
            ) : (
                <table border="1">
                    <thead>
                        <tr>
                            <th>Student Email</th>
                            <th>Project Name</th>
                            <th>Submission Date</th>
                            <th>Deadline Date</th>
                            <th>File</th>
                            <th>GitHub Profile</th> {/* ✅ New column */}
                            <th>Feedback</th>
                            <th>Submit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {evaluations.map((project) => (
                            <tr key={project.submission_id}>
                                <td>{project.student_email}</td>
                                <td>{project.project_name}</td>
                                <td>{project.submission_date}</td>
                                <td>{project.deadline_date}</td>
                                <td>
                                    {project.file_url ? (
                                        <a href={project.file_url} target="_blank" rel="noopener noreferrer" style={{ color: "white", fontWeight: "bold", textDecoration: "underline" }}>
                                            Open File
                                        </a>
                                    ) : (
                                        "No File"
                                    )}
                                </td>


                                <td>
                    {project.github_profile ? (
                        <a
                            href={project.github_profile}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "blue", textDecoration: "underline", fontWeight: "bold" }}
                        >
                            View Profile
                        </a>
                    ) : (
                        "No Profile"
                    )}
                </td>
                
                                <td>
                                    <input
                                        type="text"
                                        value={feedbacks[project.submission_id] || ""}
                                        onChange={(e) => handleFeedbackChange(project.submission_id, e.target.value)}
                                        placeholder="Enter feedback"
                                    />
                                </td>
                                <td>
                                    <button onClick={() => handleSubmitFeedback(project.submission_id)}>Submit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Results;
