import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import styles from "./Profile.module.css";
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

    const handleLogout = async () => {
        try {
            await logoutApiCall().unwrap();
            dispatch(logout());
            navigate('/login');
        } catch (error) {
            console.log(error);
        }
    }

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
        <div className={styles.container}>
            <div className={styles.headBox}>
                <button onClick={() => navigate("/dashboard")}>Back</button>
                <button onClick={handleLogout}>Logout</button>
            </div>
            <div className={styles.main}>
                <div className={styles.proContainer}>
                    <h1>PROFILE</h1>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label>Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Photo</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                            />
                            {photoPreview && (
                                <img
                                    src={photoPreview}
                                    alt="Profile Preview"
                                    className={styles.photoPreview}
                                />
                            )}
                        </div>
                        <button type="submit" className={styles.submitButton}>
                            {isLoading ? "Updating..." : "Update"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
