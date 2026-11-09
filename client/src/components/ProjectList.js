import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ProjectList() {
    const [projects, setProjects] = useState([]);
    const [message, setMessage] = useState('');

    // This loads all the projects from the backend when this component first shows up
    useEffect(() => {
        const loadProjects = async() => {
            try {
                const response = await axios.get('/api/projects');
                if (response.data.success) {
                   setProjects(response.data.projects);
                } else {
                    setMessage(response.data.message);
                }
            } catch (error) {
                setMessage('Could not reach the server');
            }
        };
        loadProjects();
    }, []);

    return (
        <div className="form-box">
            <h2>Projects</h2>

            {message && <p className="message error">{message}</p>}
            {!message && projects.length === 0 && <p>No projects yet. Create one first.</p>}

            {projects.map((project) => (
                <div className="project-card" key={project._id}>
                    <h3>{project.name}</h3>
                    <p>{project.description}</p>
                    <p><strong>Status:</strong> {project.status}</p>
                    <p>
                        <strong>Project Lead:</strong>{' '}
                        {project.lead
                            ? project.lead.f_name + ' ' + project.lead.l_name + ' (' + project.lead.username + ')'
                            : 'Unknown user'}
                    </p>
                </div>
            ))}
        </div>
    );
}

export default ProjectList;