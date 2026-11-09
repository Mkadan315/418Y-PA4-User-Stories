import React, { useState } from 'react';
import axios from 'axios'; // this library helps with sending HTTP requests

function Signup() {
    // This part stores one piece of state per input box
    // Whatever the user types here will get sent to the backend later
    const [fName, setFName] = useState('');
    const [lName, setLName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    // This part holds the success/error message we get back from the backend
    const [message, setMessage] = useState('');

    // This runs when the user clicks on the "Sign Up" button
    const handleSubmit = async (event) => {
        event.preventDefault(); // this stops the page from refreshing the default form behavior)

        try {
            // This sends all four fields to the backend's /api/auth/signup route
            const response = await axios.post('/api/auth/signup', {
                f_name: fName,
                l_name: lName,
                username: username,
                password: password
            });

            // This shows whatever message the backend had sent back, either a success or an error
            setMessage(response.data.message);

            // If the signup worked, this will clear the form so that it's ready for a new entry
            if (response.data.success) {
                setFName('');
                setLName('');
                setUsername('');
                setPassword('');
            }
        } catch (error) {
            // This part runs if the request fails like if the server isn't running
            setMessage('Could not reach the server');
        }
    };

    return (
        <div className="form-box">
            <h2>Sign Up</h2>
            <form onSubmit={handleSubmit}>
                <label>First Name</label>
                {/* Every time that the user types something, we update the matching state */}
                <input value={fName} onChange={(e) => setFName(e.target.value)} />

                <label>Last Name</label>
                <input value={lName} onChange={(e) => setLName(e.target.value)} />

                <label>Username</label>
                <input value={username} onChange={(e) => setUsername(e.target.value)} />

                <label>Password</label>
                <input type="password" value = {password} onChange={(e) => setPassword(e.target.value)} />

                <button type="submit">Sign Up</button>
            </form>

            {/* This will only show the message paragraph if there is a message */}
            {message && <p>{message}</p>}
        </div>
    );
}

export default Signup;