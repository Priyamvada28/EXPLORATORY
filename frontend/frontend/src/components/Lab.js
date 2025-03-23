import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Lab.css";

const Lab = ({ userData }) => {
  const [userDetails, setUserDetails] = useState(null);
  const email = userData.email; // Email is always present

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const studentResponse = await axios.get(
          `http://localhost:8000/api/students/${email}/`
        );
        if (studentResponse.data) {
          setUserDetails({
            name: studentResponse.data.name,
            status: "Student",
            year: studentResponse.data.year,
          });
          return;
        }
      } catch (error) {
        console.log("User is not a Student:", error);
      }

      try {
        const professorResponse = await axios.get(
          `http://localhost:8000/api/professors/${email}/`
        );
        if (professorResponse.data) {
          setUserDetails({
            name: professorResponse.data.name,
            status: "Professor",
            year: null, // Professors don’t have a year
          });
          return;
        }
      } catch (error) {
        console.log("User is not a Professor:", error);
      }

      // If neither student nor professor, show error
      setUserDetails({ name: "Unknown", status: "Unknown", year: null });
    };

    fetchUserDetails();
  }, [email]);

  if (!userDetails) {
    return <h1>Loading user data...</h1>;
  }

  const {  status } = userDetails;

  return (
    <div className="lab-container">
      <h1>Welcome to the Lab</h1>
      {/* <h2>{name}!</h2> */}
      {/* <p>Status: {status}</p> */}
      <p>Email: {email}</p>

      <div className="options-list">
        <Link to="/profile" className="option-card profile">
          Profile
        </Link>

        {status === "Professor" ? (
          <>
            <Link to="/projects" className="option-card projects">Projects</Link>
            <Link to="/requests" className="option-card requests">Requests</Link>
            <Link to="/results" className="option-card results">Results</Link>
          </>
        ) : (
          <>
            <Link to={`/application-form?email=${email}`} className="option-card form">
              Application Form
            </Link>
            <Link to="/results" className="option-card results">Results</Link>
            <Link to="/submit-project" className="option-card submit">
              Submit Project
            </Link>
            <Link to="/projects" className="option-card projects">Add/Delete (Projects)</Link>
            <Link to="/requests" className="option-card requests">Requests</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Lab;
