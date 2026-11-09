import React, { useState } from 'react';
import axios from 'axios'; // this library helps with sending HTTP requests

function Login() {
    // These hold whatever the user types into the input boxes
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    // This runs when the user clicks the "Log In" button.
    const handleSubmit = async (event) => {
        event.preventDefault(); // this stops the page from refreshing the default form behavior)

        try {
            // This sends the username and password to the backend's /api/auth/login route
            const response = await axios.post('/api/auth/login', {
                username: username,
                password: password
            });

            // The backend sends back { success: true/false, message: "..." }
            // We show that message to the user
            setMessage(response.data.message);
        } catch (error) {
            // This part runs if the request fails like if the server isn't running
            setMessage('Could not reach the server');
        }
    };

    return (
        <div className="form-box">
            <h2>Log In</h2>
            <form onSubmit={handleSubmit}>
                 <label>Username</label>
                      {/* Every time the user types, we update the "username" state */}
                      <input value={username} onChange={ (e) => setUsername(e.target.value)} />

                      <label>Password</label>
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

                      <button type="submit">Log In</button>
            </form>

            {/* This only shows the message paragraph if there is a message */}
            {message && <p>{message}</p>}
        </div>
    );
}

export default Login;