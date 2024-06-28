import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { logout, setCredentials } from "../../Redux/Slice/authSlice";
import { useLogoutMutation, useUpdateUserMutation } from "../../Redux/Slice/userApiSlice";

const Profile = () => {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [logoutApiCall] = useLogoutMutation();
    const [updateUser, { isLoading }] = useUpdateUserMutation();

    const { userInfo } = useSelector((state) => state.auth);

    const resetInputs = () => {
        setEmail("");
        setName("");
        setPassword("");
        setConfirmPassword("");
        setPhoto(null);
        setPhotoPreview(null);
    };

    const handleLogout = async () => {
        try {
            await logoutApiCall().unwrap();
            dispatch(logout());
            resetInputs();
            navigate('/login');
        } catch (error) {
            console.log(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
        } else {
            try {
                const formData = new FormData();
                formData.append('name', name);
                formData.append('email', email);
                formData.append('password', password);
                if (photo) {
                    formData.append('photo', photo);
                }

                const res = await updateUser(formData).unwrap();

                dispatch(setCredentials({ ...res }));
                toast.success("Profile updated successfully");
                setPassword('');
                setConfirmPassword('');
                navigate("/dashboard");
            } catch (error) {
                toast.error(error.data.message || error.message);
            }
        }
    };

    useEffect(() => {
        if (userInfo) {
            setName(userInfo.name);
            setEmail(userInfo.email);
            setPhotoPreview(`data:image/jpeg;base64,${userInfo.photo}`);
        }
    }, [userInfo]);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center py-6">
            <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between mb-4">
                    <button 
                        onClick={() => navigate("/dashboard")} 
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
                    >
                        Back
                    </button>
                    <button 
                        onClick={handleLogout} 
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-200"
                    >
                        Logout
                    </button>
                </div>
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-semibold">PROFILE</h1>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-col">
                        <label className="mb-2 font-medium">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="mb-2 font-medium">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="mb-2 font-medium">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="mb-2 font-medium">Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="mb-2 font-medium">Photo</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
                        />
                        {photoPreview && (
                            <img
                                src={photoPreview}
                                alt="Profile Preview"
                                className="mt-4 h-40 w-40 object-cover rounded-full mx-auto"
                            />
                        )}
                    </div>
                    <button 
                        type="submit" 
                        className="w-full py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-200"
                    >
                        {isLoading ? "Updating..." : "Update"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;
