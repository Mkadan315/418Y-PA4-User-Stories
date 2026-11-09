import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ProjectMembers() {
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);

    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [members, setMembers] = useState([]);
    const [userToAdd, setUserToAdd] = useState('');

    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    // This is a small helper method to set the message and color in one line
    const showMessage = (text, success) => {
        setMessage(text);
        setIsSuccess(success);
    };

    // This loads the projects and the users (for the dropdowns) when this component first shows up
    useEffect(() => {
        const loadData = async() => {
            try {
                const projectsResponse = await axios.get('/api/projects');
                const usersResponse = await axios.get('/api/users');
                if (projectsResponse.data.success) {
                    setProjects(projectsResponse.data.projects);
                }
                if (usersResponse.data.success) {
                    setUsers(usersResponse.data.users);
                }
            } catch (error) {
                showMessage('Could not reach the server', false);
            }
        };
        loadData();
    }, []);

    // This asks the backend for the members of one project and stores them in state
    // We call this after selecting a project and after every add/remove, which keeps the list
    // up to date.
    const loadMembers = async (projectId) => {
        if (!projectId) {
            setMembers([]);
            return;
        }
        try {
            const response = await axios.get('/api/projects/' + projectId + '/members');
            if (response.data.success) {
                setMembers(response.data.members);
            } else {
                setMembers([]);
                showMessage(response.data.message, false);
            }
        } catch (error) {
            showMessage('Could not reach the server', false);
        }
    };

    const handleSelectProject = (event) => {
        const projectId = event.target.value;
        setSelectedProjectId(projectId);
        setMessage('');
        loadMembers(projectId);
    };

    const handleAdd = async() => {
        try {
            const response = await axios.post('/api/projects/' + selectedProjectId + '/members', {user_id: userToAdd});

            showMessage(response.data.message, response.data.success);
            if (response.data.success) {
               setUserToAdd('');
               loadMembers(selectedProjectId); // this refreshes the list
            }
        } catch (error) {
           showMessage('Could not reach the server', false);
        }
    };

    const handleRemove = async(userId) => {
        try {
            const response = await axios.delete('/api/projects/' + selectedProjectId + '/members/' + userId);
            showMessage(response.data.message, response.data.success);
            loadMembers(selectedProjectId); // this refreshes the list
        } catch (error) {
          showMessage('Could not reach the server', false);
        }
    };

    return (
        <div className="form-box">
            <h2>Manage Project Members</h2>

            <label>Project</label>
            <select value={selectedProjectId} onChange={handleSelectProject}>
                <option value="">-- Select a project --</option>
                {projects.map((project) => (
                    <option key={project._id} value={project._id}>{project.name}</option>
                ))}
            </select>

            {selectedProjectId && (
                <div>
                    <h3>Current Members</h3>
                    {members.length === 0 && <p>No members to show.</p>}
                    {members.map((member) => (
                        <div className="member-row" key={member.user_id}>
                            <span>
                                {member.f_name} {member.l_name} ({member.username})
                                {member.is_lead && <strong> - Project Lead</strong>}
                            </span>
                            {/* The lead doesnt get a Remove button */ }
                            {!member.is_lead && (
                                <button onClick={() => handleRemove(member.user_id)}>Remove</button>
                            )}
                        </div>
                    ))}

                    <h3>Add a Member</h3>

                    <select value={userToAdd} onChange = {(e) => setUserToAdd(e.target.value)}>
                        <option value = "">--Select a registered user --</option>
                        {users.map((user) => (
                            <option key = {user._id} value={user._id}>
                                {user.f_name} {user.l_name} {user.username})
                            </option>
                        ))}
                    </select>
                    <button onClick={handleAdd}>Add Member</button>
                </div>
            )}

            {message && <p className={isSuccess ? 'message success' : 'message error'}>{message}</p>}
        </div>
    );
}

export default ProjectMembers;