import React, { useEffect, useState } from "react";
import "./Profile.css";

const Profile = ({ email }) => {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/profile/${encodeURIComponent(email)}/`);
                const data = await response.json();
                setProfileData(data);
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };

        if (email) fetchProfile();
    }, [email]);

    if (loading) return <p className="loading-text">Loading...</p>;
    if (!profileData) return <p className="error-text">Error fetching profile data.</p>;

    return (
        <div className="profile-container">
            <div className="profile-header">
                <div className="profile-avatar">
                    {profileData.name ? profileData.name.charAt(0) : "?"}
                </div>
                <div className="profile-info">
                    <h2>{profileData.name}</h2>
                    <p>{profileData.role}</p>
                </div>
            </div>

            {profileData.role === "student" ? (
                <div>
                    <h3 className="section-title">Submitted Projects</h3>
                    {profileData.submitted_projects.length > 0 ? (
                        <ul className="project-list">
                            {profileData.submitted_projects.map((project, index) => (
                                <li key={index} className="project-item">
                                    <strong>{project.project_name}</strong> - 
                                    <span className="text-highlight"> {project.feedback}</span>
                                    <br />
                                    <span className="text-small">Submitted on: {project.submission_date}</span>
                                    <br />
                                    <span className="text-small">Professor: {project.professor_email}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="no-projects-text">No submitted projects found.</p>
                    )}
                </div>
            ) : (
                <div>
                    <h3 className="section-title">Assigned Students</h3>
                    {profileData.assigned_students.length > 0 ? (
                        <ul className="student-list">
                            {profileData.assigned_students.map((student, index) => (
                                <li key={index} className="student-item">
                                    <strong>{student.student_name} ({student.student_year})</strong>
                                    <br />
                                    <span className="text-small">Project: {student.project_name}</span>
                                    <br />
                                    <span className="text-small">Deadline: {student.deadline}</span>
                                    <br />
                                    <a 
                                        href={student.whatsapp_link} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="whatsapp-link"
                                    >
                                        Contact on WhatsApp
                                    </a>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="no-students-text">No assigned students currently working.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Profile;
