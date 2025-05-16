import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Requests.css"; // For styling

const Requests = ({ userData }) => {
  const [isProfessor, setIsProfessor] = useState(false);
  const [requests, setRequests] = useState([]);
  const [deadlineDates, setDeadlineDates] = useState({});
  const [whatsappLinks, setWhatsappLinks] = useState({}); // ✅ Add this here
  const email = userData.email; // User's email

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/professor-requests/${email}/`
        );
        setRequests(response.data);
        setIsProfessor(true); // If we get data, the user is a professor
      } catch (error) {
        console.error("Error checking user role:", error);
        setIsProfessor(false); // If request fails, user is not a professor
      }
    };

    fetchRequests();
  }, [email]);

  const handleAccept = async (requestId) => {
    const deadline = deadlineDates[requestId];
    const whatsappLink = whatsappLinks[requestId];
    if (!deadline) {
        alert("Please enter a deadline date before accepting.");
        return;
    }
    if (!whatsappLink) {
      alert("Please enter a WhatsApp link before accepting.");
      return;
  }

    try {
        console.log("Sending request with:", {
            request_id: requestId,
            deadline_date: deadline,
            whatsapp_link: whatsappLink, 
        });

        const response = await axios.post("http://localhost:8000/api/accept-request/", {
            request_id: requestId,
            deadline_date: deadline,
            whatsapp_link: whatsappLink, // ✅ Add WhatsApp link
        });

        console.log("Response:", response.data);

        // 🚀 Remove the accepted request from UI **immediately**
        setRequests((prevRequests) => prevRequests.filter((req) => req.id !== requestId));

        // 🛠️ Optionally clear the deadline input after acceptance
        setDeadlineDates((prevDeadlines) => {
            const updatedDeadlines = { ...prevDeadlines };
            delete updatedDeadlines[requestId];
            return updatedDeadlines;
        });

        setWhatsappLinks((prevLinks) => {
          const updatedLinks = { ...prevLinks };
          delete updatedLinks[requestId];
          return updatedLinks;
      });

    } catch (error) {
        console.error("Error accepting request:", error.response ? error.response.data : error);
    }
};
  

  const handleReject = async (requestId) => {
    try {
      await axios.delete("http://localhost:8000/api/reject-request/", {
        data: { request_id: requestId },
      });

      // Remove rejected request from UI
      setRequests(requests.filter((req) => req.id !== requestId));
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  if (!isProfessor) {
    return <h1>Access Denied: You are not a Professor</h1>;
  }

  return (
    <div className="requests-container">
      <h1>Project Requests</h1>
      {requests.length === 0 ? (
        <p>No project requests at the moment.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Year</th>
              <th>Project Name</th>
              <th>Deadline</th>
              <th>WhatsApp</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id}>
                <td>{req.name}</td>
                <td>{req.year}</td>
                <td>{req.project_name}</td>
                <td>
                  <input
                    type="date"
                    value={deadlineDates[req.id] || ""}
                    onChange={(e) =>
                      setDeadlineDates({ ...deadlineDates, [req.id]: e.target.value })
                    }
                  />
                </td>
                <td>
  <input
    type="text"
    placeholder="Enter WhatsApp Link"
    value={whatsappLinks[req.id] || ""}
    onChange={(e) =>
      setWhatsappLinks({ ...whatsappLinks, [req.id]: e.target.value })
    }
  />
</td>


                <td>
                  <button onClick={() => handleAccept(req.id)}>✅ Accept</button>
                  <button onClick={() => handleReject(req.id)}>❌ Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Requests;