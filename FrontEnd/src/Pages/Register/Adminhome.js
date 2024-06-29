import React, { useEffect, useState } from "react";
import { FaTrash, FaSearch } from 'react-icons/fa'; 
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useAddTodoMutation, useUpdateTodoMutation } from '../../Redux/Slice/todoApiSlice';

export default function AdminHome() {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeUsers, setActiveUsers] = useState([]);
  const [basketItems, setBasketItems] = useState([]);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const { userInfo } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [photo, setPhoto] = useState(null);
  const [addTodo, { isError: addError }] = useAddTodoMutation();
  const [updateTodo, { isError: updateError, isLoading: isUpdating }] = useUpdateTodoMutation();

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
        userEmail: item.email
      }));
      setBasketItems(basketList);
    }
  };

  const logOut = () => {
    setIsLoggingOut(true);
    window.localStorage.clear();
    setTimeout(() => {
      navigate('/');
      window.location.reload();
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
    setSearchQuery(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('price', price);
      if (photo) {
        formData.append('photo', photo);
      }

      if (id) {
        const updatedTodo = await updateTodo({ id, formData }).unwrap();
        dispatch({ type: 'todo/updateTodo', payload: updatedTodo });
      } else {
        const newTodo = await addTodo(formData).unwrap();
        dispatch({ type: 'todo/addTodo', payload: newTodo });
      }
      
      navigate('/carwis');
    } catch (err) {
      console.error('Failed to add/update the todo:', err);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhoto(file);
  };

  if (isLoggingOut) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-2xl font-semibold">Logging Out...</p>
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
      <div className="max-w-6xl mx-auto p-6 bg-white rounded shadow-md mt-8">
        <h2 className="text-2xl font-semibold mb-4">{id ? 'Update TODO' : 'Add New TODO'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col">
            <label htmlFor="title" className="text-sm font-medium">Title:</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="price" className="text-sm font-medium">Price:</label>
            <input
              type="text"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-1 p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="description" className="text-sm font-medium">Description:</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 p-2 border border-gray-300 rounded"
            ></textarea>
          </div>
          <div className="flex flex-col">
            <label htmlFor="photo" className="text-sm font-medium">Photo:</label>
            <input
              type="file"
              id="photo"
              accept="image/*"
              onChange={handlePhotoChange}
              className="mt-1 p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-200"
            >
              {id ? 'Update TODO' : 'Add TODO'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/carwis')}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
        {addError && <p className="mt-4 text-red-500">Error adding todo: {addError.message}</p>}
        {updateError && <p className="mt-4 text-red-500">Error updating todo: {updateError.message}</p>}
        {id && (
          <button
            type="button"
            className={`w-full py-2 mt-4 bg-green-500 text-white rounded hover:bg-green-600 transition duration-200 ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleSubmit}
            disabled={isUpdating}
          >
            {isUpdating ? 'Updating...' : 'Update'}
          </button>
        )}
      </div>
    </div>
  );
}
