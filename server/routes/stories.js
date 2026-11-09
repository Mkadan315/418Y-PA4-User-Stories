const express = require('express');
const mongoose = require('mongoose');
const Project = require('../models/Project');
const ProjectMembership = require('../models/ProjectMembership');
const User = require('../models/User');
const UserStory = require('../models/UserStory');

const router = express.Router();

const PRIORITIES = ['High', 'Medium', 'Low'];
const STORY_STATUSES = ['To Do', 'In Progress', 'Done'];

// This checks that the project id is valid and the project exists.
// If something is wrong it sends the error response itself and returns null,
// so each route can just do:  if (!project) return;
async function loadProject(projectId, res) {
    if (!mongoose.isValidObjectId(projectId)) {
        res.status(400).json({ message: 'That project id is not valid.' });
        return null;
    }
    const project = await Project.findById(projectId);
    if (!project) {
        res.status(404).json({ message: 'That project does not exist.' });
        return null;
    }
    return project;
}

// This checks the text and dropdown values of a story and returns an error message, or null when everything is fine
// Status is only checked when editing, since new stories always start as 'To Do'
function checkStoryFields(body, checkStatus) {
    const { title, description, priority, status } = body;

    if (typeof title !== 'string' || title.trim() === '') {
        return 'Title is required.';
    }
    if (typeof description !== 'string' || description.trim() === '') {
        return 'Description is required.';
    }
    if (!PRIORITIES.includes(priority)) {
        return 'Please choose a priority: High, Medium, or Low.';
    }
    if (checkStatus && !STORY_STATUSES.includes(status)) {
        return 'Status must be To Do, In Progress, or Done.';
    }
    return null;
}

// Checks that the assigned user is allowed on this project
// Returns { code, message } when there is a problem, or null when it's fine
async function checkAssignee(projectId, assignedUserId) {
    // null means Unassigned, which is always allowed
    if (assignedUserId === null) {
        return null;
    }
    if (typeof assignedUserId !== 'string' || !mongoose.isValidObjectId(assignedUserId)) {
        return { code: 400, message: 'That assigned user id is not valid.' };
    }
    const user = await User.findById(assignedUserId);
    if (!user) {
        return { code: 404, message: 'The assigned user does not exist.' };
    }
    // The user must be a member of this project, not just any project
    const membership = await ProjectMembership.findOne({ project_id: projectId, user_id: assignedUserId });
    if (!membership) {
        return { code: 400, message: user.username + ' is not a member of this project, so they cannot be assigned its stories.' };
    }
    return null;
}

// Viewing the backlog of one project
router.get('/:projectId/stories', async (req, res) => {
    try {
        const project = await loadProject(req.params.projectId, res);
        if (!project) return;

        // Only the stories of this project, with the assigned user's details filled in
        const stories = await UserStory.find({ project_id: project._id })
            .populate('assigned_user_id', 'f_name l_name username');

        const result = [];
        for (const story of stories) {
            const assignedUser = story.assigned_user_id; // a user, or null when Unassigned
            result.push({
                _id: story._id,
                title: story.title,
                description: story.description,
                priority: story.priority,
                status: story.status,
                assigned_user_id: assignedUser ? assignedUser._id : null,
                assigned_user: assignedUser
                    ? { f_name: assignedUser.f_name, l_name: assignedUser.l_name, username: assignedUser.username }
                    : null
            });
        }

        return res.json(result);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Something went wrong on the server end.' });
    }
});

// Create a story
// The React app sends: { title, description, priority, assigned_user_id }
router.post('/:projectId/stories', async (req, res) => {
    try {
        const project = await loadProject(req.params.projectId, res);
        if (!project) return;

        const fieldProblem = checkStoryFields(req.body, false);
        if (fieldProblem) {
            return res.status(400).json({ message: fieldProblem });
        }

        // An empty value means Unassigned, which we store as null
        const assignedUserId = req.body.assigned_user_id || null;
        const assigneeProblem = await checkAssignee(project._id, assignedUserId);
        if (assigneeProblem) {
            return res.status(assigneeProblem.code).json({ message: assigneeProblem.message });
        }

        // We build the story ourselves instead of saving req.body directly
        // This is so that the project id comes from the URL and the status is always 'To Do'
        const newStory = new UserStory({
            project_id: project._id,
            title: req.body.title.trim(),
            description: req.body.description.trim(),
            priority: req.body.priority,
            status: 'To Do',
            assigned_user_id: assignedUserId
        });
        await newStory.save();

        return res.status(201).json({ message: 'Story "' + newStory.title + '" was created.', story: newStory });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Something went wrong on the server end.' });
    }
});

// Edit a story
// The React app sends: { title, description, priority, status, assigned_user_id }
router.put('/:projectId/stories/:storyId', async (req, res) => {
    try {
        const project = await loadProject(req.params.projectId, res);
        if (!project) return;

        const { storyId } = req.params;
        if (!mongoose.isValidObjectId(storyId)) {
            return res.status(400).json({ message: 'That story id is not valid.' });
        }

        // We look for the story by its own id and this project's id
        // A story from another project can never be found or changed) through this URL
        const story = await UserStory.findOne({ _id: storyId, project_id: project._id });
        if (!story) {
            return res.status(404).json({ message: 'That story does not exist in this project.' });
        }

        const fieldProblem = checkStoryFields(req.body, true);
        if (fieldProblem) {
            return res.status(400).json({ message: fieldProblem });
        }

        const assignedUserId = req.body.assigned_user_id || null;
        const assigneeProblem = await checkAssignee(project._id, assignedUserId);
        if (assigneeProblem) {
            return res.status(assigneeProblem.code).json({ message: assigneeProblem.message });
        }

        // Only these five fields can change, project_id will be the same
        story.title = req.body.title.trim();
        story.description = req.body.description.trim();
        story.priority = req.body.priority;
        story.status = req.body.status;
        story.assigned_user_id = assignedUserId;
        await story.save();

        return res.json({ message: 'Story "' + story.title + '" was updated.' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Something went wrong on the server end.' });
    }
});

// Delete a story
router.delete('/:projectId/stories/:storyId', async (req, res) => {
    try {
        const project = await loadProject(req.params.projectId, res);
        if (!project) return;

        const { storyId } = req.params;
        if (!mongoose.isValidObjectId(storyId)) {
            return res.status(400).json({ message: 'That story id is not valid.' });
        }

        // We use both the story id and the project id
        const result = await UserStory.deleteOne({ _id: storyId, project_id: project._id });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'That story does not exist in this project.' });
        }

        return res.json({ message: 'The story was deleted.' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Something went wrong on the server end.' });
    }
});

module.exports = router;