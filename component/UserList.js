import { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs, deleteDoc, doc, setDoc } from "firebase/firestore";
import "../src/app/styles/main.scss";

const UserList = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [newUser, setNewUser] = useState({ name: "", phoneNumber: "", role: "" });

  // Fetch team members
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const teamCollection = collection(db, "STMembers");
        const teamSnapshot = await getDocs(teamCollection);
        const teamList = teamSnapshot.docs.map((docSnap) => ({
          id: docSnap.id, // phone number is the doc ID
          ...docSnap.data(),
        }));
        setTeamMembers(teamList);
      } catch (err) {
        console.error("Error fetching team members:", err);
      }
    };
    fetchTeamMembers();
  }, []);

  // Add user manually
  const handleManualAdd = async () => {
    if (!newUser.name.trim() || !newUser.phoneNumber.trim()) {
      alert("Name and Phone Number are required!");
      return;
    }

    const userId = newUser.phoneNumber; // phone number as doc ID

    const user = {
      id: userId, // ✅ also store it inside the document
      name: newUser.name,
      phoneNumber: newUser.phoneNumber,
      role: newUser.role || "User",
    };

    try {
      const userRef = doc(db, "STMembers", userId);
      await setDoc(userRef, user, { merge: true }); // store id inside doc

      alert("User added successfully!");
      setTeamMembers([...teamMembers, user]);
      setNewUser({ name: "", phoneNumber: "", role: "" });
    } catch (error) {
      console.error("Error adding user:", error);
      alert("Failed to add user. Try again.");
    }
  };

  // Remove user
  const removeUserFromTeam = async (userId) => {
    try {
      await deleteDoc(doc(db, "STMembers", userId));
      setTeamMembers(teamMembers.filter((user) => user.id !== userId));
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  return (
    <section className="c-form box">
      <h2>Manage Team Members</h2>
      <button className="m-button-5" onClick={() => window.history.back()}>
        Back
      </button>

      {/* Add User Manually */}
      <h3>Add User Manually</h3>
      <ul>
        <li className="form-row">
          <h4>Name<sup>*</sup></h4>
          <div className="multipleitem">
            <input
              type="text"
              placeholder="Name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            />
          </div>
        </li>
        <li className="form-row">
          <h4>Mobile No<sup>*</sup></h4>
          <div className="multipleitem">
            <input
              type="text"
              placeholder="Mobile No"
              value={newUser.phoneNumber}
              onChange={(e) =>
                setNewUser({ ...newUser, phoneNumber: e.target.value })
              }
            />
          </div>
        </li>
        <li className="form-row">
          <h4>Role</h4>
          <div className="multipleitem">
            <input
              type="text"
              placeholder="Role (optional)"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            />
          </div>
        </li>
      </ul>

      <button className="m-button-7" onClick={handleManualAdd}>
        Add User
      </button>

      {/* Team Members Table */}
      {teamMembers.length > 0 && (
        <table className="table-class">
          <thead>
            <tr>
              <th>Name</th>
              <th>Mobile No (ID)</th>
              <th>Role</th>
              <th>Remove</th>
            </tr>
          </thead>
          <tbody>
            {teamMembers.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.id}</td> {/* phone number as ID */}
                <td>{user.role}</td>
                <td>
                  <button
                    className="m-button-7"
                    onClick={() => removeUserFromTeam(user.id)}
                    style={{ backgroundColor: "#f16f06", color: "white" }}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
};

export default UserList;
