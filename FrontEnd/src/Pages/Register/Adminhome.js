import React, { useEffect, useState } from "react";
import { FaTrash, FaSearch } from 'react-icons/fa'; 
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function AdminHome() {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeUsers, setActiveUsers] = useState([]);
  const [basketItems, setBasketItems] = useState([]);
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Yeni eklenen state
  const navigate = useNavigate();
  const { userInfo } = useSelector(state => state.auth);

  useEffect(() => {
    fetchAllUsers();
    fetchActiveUsers();
    fetchBasketItems();
  }, [searchQuery]);

  const fetchAllUsers = () => {
    fetch(`http://localhost:8000/api/users/?search=${encodeURIComponent(searchQuery)}`)
      .then((res) => res.json())
      .then((data) => {
        setData(data.allUsers);
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
        toast.error('Error fetching users');
      });
  };

  const fetchActiveUsers = () => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      const userInfo = JSON.parse(storedUserInfo);
      setActiveUsers([userInfo]);
    }
  };

  const fetchBasketItems = () => {
    const storedBasketList = localStorage.getItem('basketList');
    if (storedBasketList) {
      const basketList = JSON.parse(storedBasketList).map(item => ({
        ...item,
        userEmail: item.email // user.email yerine userEmail
      }));
      setBasketItems(basketList);
    }
  };

  const logOut = () => {
    setIsLoggingOut(true); // Yükleme ekranını göster
    window.localStorage.clear();
    setTimeout(() => {
      navigate('/');
      window.location.reload(); // Home sayfasına geçerken sayfayı yenile
    }, 3000);
  };

  const deleteUser = (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      fetch(`http://localhost:8000/api/users/${id}`, {
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
            toast.success(data.message);
            setData((prevData) => prevData.filter((user) => user._id !== id));
          } else {
            toast.error("An error occurred while deleting the user.");
          }
        })
        .catch((error) => {
          console.error("Error deleting user:", error);
          toast.error("An error occurred while deleting the user.");
        });
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  if (isLoggingOut) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-2xl font-semibold">Logout Admin...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gray-100">
      <div className={`max-w-6xl mx-auto p-6 bg-white rounded shadow-md ${userInfo.userType === 'Admin' ? 'block' : 'hidden'}`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold">Welcome Admin</h3>
          <button
            onClick={logOut}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
          >
            Log Out
          </button>
        </div>
        <div className="relative mb-6">
          <FaSearch className="absolute left-4 top-3 text-gray-500" />
          <input
            type="text"
            placeholder="Search..."
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
          />
          <span className="absolute right-4 top-3 text-gray-500">
            {searchQuery.length > 0
              ? `Records Found ${data.length}`
              : `Total Records ${data.length}`}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-100">
              <tr className="text-left">
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">User Type</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data
                .filter((user) =>
                  user.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((user) => (
                  <tr key={user._id} className="text-left">
                    <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.userType}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-4">
                        <FaTrash
                          className="cursor-pointer text-red-600 hover:text-red-800"
                          onClick={() => deleteUser(user._id, user.name)}
                        />
                        <button
                          className={`px-2 py-1 text-xs rounded ${
                            activeUsers.find(activeUser => activeUser._id === user._id) ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                          }`}
                        >
                          {activeUsers.find(activeUser => activeUser._id === user._id) ? 'Active' : 'Inactive'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="overflow-x-auto mt-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Basket Items</h3>
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-100">
              <tr className="text-left">
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">User Email</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Product ID</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {basketItems.map((item) => (
                <tr key={item.id} className="text-left">
                  <td className="px-6 py-4 whitespace-nowrap ">{item.userEmail}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(item.dateAdded).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className={`${userInfo.userType === 'Admin' ? 'hidden' : 'block'} text-center mt-8`}>
        <p className="text-gray-500">You are not authorized to view this page.</p>
      </div>
    </div>
  );
}
