import React, { useState } from 'react';
import { FaReact } from 'react-icons/fa';
import { useDropzone } from 'react-dropzone';
import _ from 'lodash';
import '../style.css';

const UserLogin = ({ setUser }) => {
    const [userName, setUserName] = useState('');
    const [profilePic, setProfilePic] = useState(null);

    const onDrop = (acceptedFiles) => {
        // Assuming user selects only one file
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            setProfilePic(file);
        }
    };

    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    const handleUser = () => {
        if (!userName) return;

        localStorage.setItem('user', userName);
        setUser(userName);

        if (profilePic) {
            // Upload profile pic to server or set it directly
            // For demonstration, using a placeholder image
            const reader = new FileReader();
            reader.onload = () => {
                localStorage.setItem('avatar', reader.result);
            };
            reader.readAsDataURL(profilePic);
        } else {
            // Set default avatar using picsum.photos
            localStorage.setItem('avatar', `https://picsum.photos/id/${_.random(1, 1000)}/200/300`);
        }
    };

    return (
        <div className='login_container'>
            <div className='login_title'>
                <FaReact className='login_icon'/>
                <h1>Chat App</h1>
            </div>
            <div className='login_form'>
                <input
                    type="text"
                    placeholder='Enter a Unique Name'
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                />
                <div {...getRootProps({ className: 'dropzone' })}>
                    <input {...getInputProps()} />
                    <p>Drag 'n' drop a profile picture here, or click to select one</p>
                </div>
                <button onClick={handleUser}>Login</button>
            </div>
        </div>
    );
};

export default UserLogin;
