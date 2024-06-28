import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useRegisterMutation } from "../../Redux/Slice/userApiSlice";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "../../Redux/Slice/authSlice";
import { toast } from "react-toastify";
import { IoClose } from "react-icons/io5";
import 'react-toastify/dist/ReactToastify.css';
import { useDropzone } from 'react-dropzone';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [photo, setPhoto] = useState(null);
    const [userType, setUserType] = useState("");
    const [secretKey, setSecretKey] = useState("");

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();

    const [register, { isLoading }] = useRegisterMutation();

    const { userInfo } = useSelector(state => state.auth);

    useEffect(() => {
        if (userInfo) {
            const { from } = location.state || { from: { pathname: "/" } };
            navigate(from);
        }
    }, [navigate, userInfo, location.state]);

    const handleRegister = async (e) => {

        if (userType == "Admin" && secretKey != "ADMIN") {
            e.preventDefault();
            alert("Invalid Admin");
          } else {

              e.preventDefault();
              


        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            formData.append('password', password);
            formData.append('userType', userType);
            if (photo) {
                formData.append('photo', photo);
            }

            const res = await register(formData).unwrap();
            dispatch(setCredentials({ ...res }));

            // After updating user information, redirect
            const { from } = location.state || { from: { pathname: "/" } };
            navigate(from);
        } catch (error) {
            toast.error('Registration failed');
        }
          }

    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: 'image/*',
        maxSize: 20971520, // 10 MB limit
        onDrop: (acceptedFiles) => {
            if (acceptedFiles.length > 0) {
                const file = acceptedFiles[0];
                if (file.size <= 20971520) { // Check if file size is within limit
                    setPhoto(file);
                } else {
                    toast.error('File size exceeds 10 MB limit');
                }
            }
        }
    });

    const handleClearUploadPhoto = () => {
        setPhoto(null);
    };

    return (
        <section className="bg-gray-100 min-h-screen flex items-center justify-center">
            <div className="bg-white p-8 rounded shadow-lg w-full sm:w-96">
                <h1 className="text-2xl font-bold mb-4">REGISTER</h1>
                <form onSubmit={handleRegister} className="space-y-4">
                <h3>Register</h3>
          <div>
            Register As
            <input
              type="radio"
              name="UserType"
              value="User"
              onChange={(e) => setUserType(e.target.value)}
            />
            User
            <input
              type="radio"
              name="UserType"
              value="Admin"
              onChange={(e) => setUserType(e.target.value)}
            />
            Admin
          </div>
          {userType == "Admin" ? (
            <div className="mb-3">
              <label>Secret Key</label>
              <input
                type="text"
                className="form-control"
                placeholder="Secret Key"
                onChange={(e) => setSecretKey(e.target.value)}
              />
            </div>
          ) : null}


                    <input
                        type="text"
                        name="name"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="border rounded w-full px-3 py-2"
                    />
                    <input
                        type="text"
                        name="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="border rounded w-full px-3 py-2"
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="border rounded w-full px-3 py-2"
                    />
                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="border rounded w-full px-3 py-2"
                    />
                    <div className="flex flex-col gap-1">
                        <label htmlFor="photo" className="text-sm">Photo:</label>
                        <div {...getRootProps({ className: 'dropzone border rounded px-4 py-2 flex justify-center items-center cursor-pointer' })}>
                            <input {...getInputProps()} />
                            <p className="text-sm max-w-[300px] text-center truncate">
                                {photo ? photo.name : (isDragActive ? "Drop the files here..." : "Drag 'n' drop some files here, or click to select files")}
                            </p>
                            {photo && (
                                <button type="button" className="text-lg ml-2 text-red-600 hover:text-red-800" onClick={handleClearUploadPhoto}>
                                    <IoClose />
                                </button>
                            )}
                        </div>
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed">
                        {isLoading ? 'Creating User' : 'Register'}
                    </button>
                </form>
                <p className="text-center mt-4 text-sm text-gray-600 cursor-pointer" onClick={() => navigate('/login')}>
                    <span>Login</span>
                </p>
            </div>
        </section>
    );
};

export default Register;
