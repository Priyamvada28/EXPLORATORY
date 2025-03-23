// import axios from "axios";

// const BASE_URL = "http://127.0.0.1:8000";

// // Fetch projects based on student's year
// export const fetchProjectsByYear = async (year) => {
//     try {
//         const response = await axios.get(`${BASE_URL}/api/projects/?year=${year}`);
//         return response.data;
//     } catch (error) {
//         console.error("Error fetching projects:", error);
//         return [];
//     }
// };

// // Fetch all professors
// export const fetchProfessors = async () => {
//     try {
//         const response = await axios.get(`${BASE_URL}/api/professors/`);
//         return response.data;
//     } catch (error) {
//         console.error("Error fetching professors:", error);
//         return [];
//     }
// };

// // Submit application request
// export const submitApplication = async (applicationData) => {
//     try {
//         const response = await axios.post(`${BASE_URL}/api/requestforms/`, applicationData);
//         return response.data;
//     } catch (error) {
//         console.error("Error submitting application:", error.response?.data || error);
//         throw error;
//     }
// };
