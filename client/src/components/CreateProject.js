import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CreateProject() {
    // One piece of state for each input box
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('');
    const [leadId, setLeadId] = useState('');

    // The registered users we get from the backend (for the project lead dropdown)
    const [users, setUsers] = useState([]);

    // The message from the backend and whether it was a success or not (user for the color)
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    // This runs once when the component first shows up; it loads the users from MongoDB
    useEffect(() => {
        const loadUsers = async () => {
            try {
                const response = await axios.get('/api/users');
                if (response.data.success) {
                    setUsers(response.data.users);
                } else {
                    setMessage(response.data.message);
                    setIsSuccess(false);
                }
            } catch (error) {
                setMessage('Could not reach the server');
                setIsSuccess(false);
            }
        };
        loadUsers();
    }, []);

    // This runs when the user clicks "Create Project"
    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            // This sends all 4 fields to the backend
            const response = await axios.post('/api/projects', {
                name: name,
                description: description,
                status: status,
                project_lead_id: leadId
            });

            setMessage(response.data.message)
            setIsSuccess(response.data.success);

            // If it worked, this clears the form so that it's ready for the next project
            if (response.data.success) {
                setName('');
                setDescription('');
                setStatus('');
                setLeadId('');
            }
        } catch (error) {
            setMessage('Could not reach the server');
            setIsSuccess(false);
        }
    };

    return (
        <div className="form-box">
            <h2>Create Project</h2>
            <form onSubmit={handleSubmit}>
                <label>Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} />

                <label>Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="3" />

                <label>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="">-- Select a status --</option>
                    <option value="Planning">Planning</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                </select>

                <label>Project Lead</label>
                <select value={leadId} onChange= {(e) => setLeadId(e.target.value)}>
                    <option value="">-- Select a registered user --</option>
                    {users.map((user) => (
                        <option key={user._id} value={user._id}>
                            {user.f_name} {user.l_name} ({user.username})
                        </option>
                    ))}
                </select>

                <button type="submit">Create Project</button>
            </form>

            {message && <p className={isSuccess ? 'message success' : 'message error'}>{message}</p>}
        </div>
    );
}

export default CreateProject;