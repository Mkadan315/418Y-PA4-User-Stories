import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getErrorMessage } from '../helpers';

function ProjectBacklog() {
    // This shows the projects for the dropdown, and which one is selected
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState('');

    // This is the data of the selected project, stories is null until the stories have loaded up
    const [stories, setStories] = useState(null);
    const [members, setMembers] = useState([]);

    // This shows which story has its description open
    const [detailsStoryId, setDetailsStoryId] = useState('');

    // This shows if the story form. formMode is '' (closed), 'create', or 'edit'
    const [formMode, setFormMode] = useState('');
    const [editingStoryId, setEditingStoryId] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('');
    const [status, setStatus] = useState('To Do');
    const [assignedUserId, setAssignedUserId] = useState('');

    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    // When this number changes, the effect below loads the stories and members again
    const [reloadCount, setReloadCount] = useState(0);

    const showMessage = (text, success) => {
        setMessage(text);
        setIsSuccess(success);
    };

    // This loads the projects for the dropdown and runs once
    useEffect(() => {
        const loadProjects = async () => {
            try {
                const response = await axios.get('/api/projects');
                if (response.data.success) {
                    setProjects(response.data.projects);
                } else {
                    setMessage(response.data.message);
                    setIsSuccess(false);
                }
            } catch (error) {
                setMessage(getErrorMessage(error));
                setIsSuccess(false);
            }
        };
        loadProjects();
    }, []);

    // This loads the stories and the members of the selected project
    // It runs again whenever the selected project changes or reloadCount changes
    useEffect(() => {
        // The "ignore" stops a slow, old response from replacing the data of a newer project
        let ignore = false;

        const loadBacklog = async () => {
            try {
                const storiesResponse = await axios.get('/api/projects/' + selectedProjectId + '/stories');
                const membersResponse = await axios.get('/api/projects/' + selectedProjectId + '/members');
                if (!ignore) {
                    setStories(storiesResponse.data);
                    if (membersResponse.data.success) {
                        setMembers(membersResponse.data.members);
                    } else {
                        setMessage(membersResponse.data.message);
                        setIsSuccess(false);
                    }
                }
            } catch (error) {
                if (!ignore) {
                    setMessage(getErrorMessage(error));
                    setIsSuccess(false);
                }
            }
        };

        if (selectedProjectId) {
            loadBacklog();
        }

        return () => {
            ignore = true;
        };
    }, [selectedProjectId, reloadCount]);

    const reloadBacklog = () => {
        setReloadCount(reloadCount + 1);
    };

    // When another project is chosen, this clears everything that belonged to the old one
    const handleSelectProject = (event) => {
        setSelectedProjectId(event.target.value);
        setStories(null);
        setMembers([]);
        setDetailsStoryId('');
        setFormMode('');
        setEditingStoryId('');
        setMessage('');
    };

    const closeForm = () => {
        setFormMode('');
        setEditingStoryId('');
    };

    // This opens the form empty, to create a new story
    const openCreateForm = () => {
        setFormMode('create');
        setEditingStoryId('');
        setTitle('');
        setDescription('');
        setPriority('');
        setStatus('To Do');
        setAssignedUserId('');
        setMessage('');
    };

    // This opens the form filled with the existing values of a story
    const openEditForm = (story) => {
        setFormMode('edit');
        setEditingStoryId(story._id);
        setTitle(story.title);
        setDescription(story.description);
        setPriority(story.priority);
        setStatus(story.status);
        setAssignedUserId(story.assigned_user_id || '');
        setMessage('');
    };

    const toggleDetails = (storyId) => {
        setDetailsStoryId(detailsStoryId === storyId ? '' : storyId);
    };

    // This runs when the form is submitted, for both creating and editing
    const handleSave = async (event) => {
        event.preventDefault();

        const body = {
            title: title,
            description: description,
            priority: priority,
            // The "Unassigned" choice has an empty value, and we send that as null
            assigned_user_id: assignedUserId === '' ? null : assignedUserId
        };

        try {
            let response;
            if (formMode === 'create') {
                response = await axios.post('/api/projects/' + selectedProjectId + '/stories', body);
            } else {
                // Editing also sends the status, and the story id goes in the URL
                body.status = status;
                response = await axios.put('/api/projects/' + selectedProjectId + '/stories/' + editingStoryId, body);
            }
            showMessage(response.data.message, true);
            closeForm();
            reloadBacklog();
        } catch (error) {
            // Validation errors show up here and the form stays open so that the user can fix it
            showMessage(getErrorMessage(error), false);
        }
    };

    const handleDelete = async (story) => {
        // If the user clicks Cancel, we stop here and nothing is deleted
        if (!window.confirm('Delete the story "' + story.title + '"?')) {
            return;
        }

        try {
            const response = await axios.delete('/api/projects/' + selectedProjectId + '/stories/' + story._id);
            showMessage(response.data.message, true);
            if (editingStoryId === story._id) closeForm();
            if (detailsStoryId === story._id) setDetailsStoryId('');
            reloadBacklog();
        } catch (error) {
            showMessage(getErrorMessage(error), false);
        }
    };

    return (
        <div className="form-box">
            <h2>Project Backlog</h2>

            <label>Project</label>
            <select value={selectedProjectId} onChange={handleSelectProject}>
                <option value="">-- Select a project --</option>
                {projects.map((project) => (
                    <option key={project._id} value={project._id}>{project.name}</option>
                ))}
            </select>

            {!selectedProjectId && <p>Select a project to see its backlog.</p>}

            {selectedProjectId && (
                <div>
                    <button onClick={openCreateForm}>Add Story</button>

                    {formMode && (
                        <form onSubmit={handleSave} className="story-form">
                            <h3>{formMode === 'create' ? 'New Story' : 'Edit Story'}</h3>

                            <label>Title</label>
                            <input value={title} onChange={(e) => setTitle(e.target.value)} />

                            <label>Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows="3"
                                placeholder="As a [type of user], I want [goal], so that [benefit]."
                            />

                            <label>Priority</label>
                            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                                <option value="">-- Select a priority --</option>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>

                            {/* New stories always start as To Do, so only editing shows the status */}
                            {formMode === 'edit' && (
                                <div>
                                    <label>Status</label>
                                    <select value={status} onChange={(e) => setStatus(e.target.value)}>
                                        <option value="To Do">To Do</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Done">Done</option>
                                    </select>
                                </div>
                            )}

                            <label>Assigned Member</label>
                            <select value={assignedUserId} onChange={(e) => setAssignedUserId(e.target.value)}>
                                <option value="">Unassigned</option>
                                {/* Only the members of the selected project are listed */}
                                {members.map((member) => (
                                    <option key={member.user_id} value={member.user_id}>
                                        {member.f_name} {member.l_name} ({member.username})
                                    </option>
                                ))}
                            </select>

                            <button type="submit">{formMode === 'create' ? 'Create Story' : 'Save Changes'}</button>
                            <button type="button" onClick={closeForm}>Cancel</button>
                        </form>
                    )}

                    <h3>Stories</h3>
                    {stories === null && <p>Loading...</p>}
                    {stories !== null && stories.length === 0 && <p>This project has no stories yet.</p>}

                    {stories !== null && stories.map((story) => (
                        <div className="story-card" key={story._id}>
                            <h4>{story.title}</h4>
                            <p><strong>Priority:</strong> {story.priority}</p>
                            <p><strong>Status:</strong> {story.status}</p>
                            <p>
                                <strong>Assigned:</strong>{' '}
                                {story.assigned_user
                                    ? story.assigned_user.f_name + ' ' + story.assigned_user.l_name + ' (' + story.assigned_user.username + ')'
                                    : 'Unassigned'}
                            </p>

                            {detailsStoryId === story._id && (
                                <p className="story-description">{story.description}</p>
                            )}

                            <button onClick={() => toggleDetails(story._id)}>
                                {detailsStoryId === story._id ? 'Hide Details' : 'Details'}
                            </button>
                            <button onClick={() => openEditForm(story)}>Edit</button>
                            <button onClick={() => handleDelete(story)}>Delete</button>
                        </div>
                    ))}
                </div>
            )}

            {message && <p className={isSuccess ? 'message success' : 'message error'}>{message}</p>}
        </div>
    );
}

export default ProjectBacklog;