import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import "./App.css";

function App() {
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [resources, setResources] = useState([]);
  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    owner: "",
  });

  useEffect(() => {
    // Fetch resources from the backend
    axios
      .get("http://localhost:5000/api/resources")
      .then((response) => setResources(response.data))
      .catch((error) => console.error("Error fetching resources:", error));
  }, []);

  const handleAddResource = () => {
    // Add a new resource to the backend
    axios
      .post("http://localhost:5000/api/resources", newResource)
      .then((response) => {
        setResources([...resources, response.data]);
        setNewResource({
          title: "",
          description: "",
          owner: "",
        });
      })
      .catch((error) => console.error("Error adding resource:", error));
  };

  const handleUpdateAvailability = (id, start, end) => {
    // Update availability for a resource on the backend
    axios
      .put(`http://localhost:5000/api/resources/${id}/availability`, {
        start,
        end,
      })
      .then(() => {
        // Optional: Update the local state to reflect the changes immediately
        const updatedResources = resources.map((resource) =>
          resource._id === id
            ? { ...resource, availability: { start, end } }
            : resource
        );
        setResources(updatedResources);
      })
      .catch((error) => console.error("Error updating availability:", error));
  };

  const handleLogin = () => {
    // Implement user login on the backend and store the token locally
    axios
      .post("http://localhost:5000/api/login", {
        username: "testUser",
        password: "testUserPassword",
      })
      .then((response) => {
        localStorage.setItem("token", response.data.token);
        setLoggedIn(true);
      })
      .catch((error) => console.error("Error logging in:", error));
  };

  const handleLogout = () => {
    // Clear the stored token and update the local state
    localStorage.removeItem("token");
    setLoggedIn(false);
  };

  return (
    <div>
      <h1>Community Resource Sharing App</h1>
      {isLoggedIn ? (
        <div>
          <ul>
            {resources.map((resource) => (
              <li key={resource._id}>
                {resource.title} - {resource.description} (Owner:{" "}
                {resource.owner}
                )
                <br />
                Availability:
                {resource.availability
                  ? `${moment(resource.availability.start).format(
                      "YYYY-MM-DD"
                    )} to ${moment(resource.availability.end).format(
                      "YYYY-MM-DD"
                    )}  `
                  : "Not specified"}
                <br />
                Update Availability: <br />
                <input
                  type="datetime-local"
                  value={
                    resource.availability ? resource.availability.start : ""
                  }
                  onChange={(e) =>
                    setNewResource({ ...newResource, start: e.target.value })
                  }
                />
                <input
                  type="datetime-local"
                  value={resource.availability ? resource.availability.end : ""}
                  onChange={(e) =>
                    setNewResource({ ...newResource, end: e.target.value })
                  }
                />
                <button
                  onClick={() =>
                    handleUpdateAvailability(
                      resource._id,
                      newResource.start,
                      newResource.end
                    )
                  }
                >
                  Update
                </button>
              </li>
            ))}
          </ul>
          <h2>Add New Resource:</h2>
          <input
            type="text"
            placeholder="Title"
            value={newResource.title}
            onChange={(e) =>
              setNewResource({ ...newResource, title: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Description"
            value={newResource.description}
            onChange={(e) =>
              setNewResource({ ...newResource, description: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Owner"
            value={newResource.owner}
            onChange={(e) =>
              setNewResource({ ...newResource, owner: e.target.value })
            }
          />
          <button onClick={handleAddResource}>Add Resource</button>
          <div>
            {" "}
            <button onClick={handleLogout}>Logout</button>
          </div>
        </div>
      ) : (
        <div>
          <h2>Login:</h2>
          <input type="text" placeholder="Username" />
          <input type="password" placeholder="Password" />
          <button onClick={handleLogin}>Login</button>
        </div>
      )}
    </div>
  );
}

export default App;
