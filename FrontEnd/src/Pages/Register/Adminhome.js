import React, { useEffect, useState } from "react";
import { faTrash, faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSelector } from "react-redux";

export default function AdminHome() {
  // Setting state
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    allUsers();
  }, [searchQuery]);

  const allUsers = () => {
    fetch(`http://localhost:8000/api/users/?search=${encodeURIComponent(searchQuery)}`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data); // Gelen veriyi konsolda kontrol edin
        setData(data.allUsers); // State'i güncelle
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
        // Hata durumunu konsolda kontrol edebilirsiniz
      });
  };
  

  // Logout
  const logOut = () => {
    window.localStorage.clear();
    window.location.href = "./login";
  };

  // Deleting user from server and updating local state
  const deleteUser = (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      fetch(`http://localhost:8000/api/users/delete/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Network response was not ok");
          }
          return res.json();
        })
        .then((data) => {
          if (data.success) {
            alert(data.message); // Show the deletion result message
            setData((prevData) => prevData.filter((user) => user._id !== id)); // Update local state
          } else {
            alert("An error occurred while deleting the user.");
          }
        })
        .catch((error) => {
          console.error("Error deleting user:", error);
          alert("An error occurred while deleting the user.");
        });
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value); // Arama sorgusunu state'e güncelle
  };

  const { userInfo } = useSelector(state => state.auth);

  return (
    <div className="auth-wrapper" style={{ height: "auto", marginTop: 50,display: userInfo.userType === 'Admin' ? 'block' : 'none' }}>
      <div className="auth-inner" style={{ width: "fit-content" }}>
        <h3>Welcome Admin</h3>
        <div style={{ position: "relative", marginBottom: 10 }}>
          <FontAwesomeIcon
            icon={faSearch}
            style={{ position: "absolute", left: 10, top: 13, color: "black" }}
          />
          <input
            type="text"
            placeholder="Search..."
            onChange={handleSearch}
            style={{
              padding: "8px 32px 8px 32px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              width: "100%",
              boxSizing: "border-box",
            }}
          />
          <span
            style={{ position: "absolute", right: 10, top: 8, color: "#aaa" }}
          >
            {searchQuery.length > 0
              ? `Records Found ${data.length}`
              : `Total Records ${data.length}`}
          </span>
        </div>
        <table style={{ width: 700 }}>
          <thead>
            <tr style={{ textAlign: "center" }}>
              <th>Name</th>
              <th>Email</th>
              <th>User Type</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
  {data
    .filter((user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .map((user) => (
      <tr key={user._id} style={{ textAlign: "center" }}>
        <td>{user.name}</td>
        <td>{user.email}</td>
        <td>{user.userType}</td>
        <td>
          <FontAwesomeIcon
            icon={faTrash}
            onClick={() => deleteUser(user._id, user.name)}
          />
        </td>
      </tr>
    ))}
</tbody>

        </table>

        <button
          onClick={logOut}
          className="btn btn-primary"
          style={{ marginTop: 10 }}
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
