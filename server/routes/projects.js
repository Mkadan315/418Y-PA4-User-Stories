const express = require('express');
const mongoose = require('mongoose');
const Project = require('../models/Project');
const ProjectMembership = require('../models/ProjectMembership');
const UserStory = require('../models/UserStory');
const User = require('../models/User');

const router = express.Router();

const VALID_STATUSES = ['Planning', 'Active', 'Completed'];

// Creating the project
// The React app sends: {the name, description, status, project_lead_id }
router.post('/', async (req, res) => {
    try {
        const { name, description, status, project_lead_id } = req.body;

        // This part makes sure that nothing is missing
        if (!name || !description || !status || !project_lead_id) {
            return res.json({ sucess: false, message: 'Please fill out every field.' });
        }
        if (!VALID_STATUSES.includes(status)) {
            return res.json({ sucess: false, message: 'Status must be Planning, Active, or Completed.' });
        }

        // This part makes sure that the Project Lead is a real user
        if (!mongoose.isValidObjectId(project_lead_id)) {
            return res.json({ sucess: false, message: 'That Project Lead id isnt valid.' });
        }
        const lead = await User.findById(project_lead_id);
        if (!lead) {
            return res.json({ sucess: false, message: 'The selected Project Lead doesnt exist.' });
        }

        // This part saves the new project in MongoDB
        const newProject = new Project({ name, description, status, project_lead_id });
        await newProject.save();

        // The Project Lead also has to be a member, so we save that membership also
        const leadMembership = new ProjectMembership({ project_id: newProject._id, user_id: project_lead_id });
        await leadMembership.save();

        return res.json({ success: true, message: 'Project "' + name + '" was created.' });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: 'Something went wrong on the server side. '});
    }
});

// This views the projects
// The populate() swaps the stored lead id for the real user, so that React can show a name
router.get('/', async (req, res) => {
    try {
        const projects = await Project.find().populate('project_lead_id', 'f_name l_name username');

        // We rename the project_lead_id to "lead" here since now it holds a whole user, not just an id
        const result = [];
        for (const project of projects) {
            result.push({
                _id: project._id,
                name: project.name,
                description: project.description,
                status: project.status,
                lead: project.project_lead_id
            });
        }

        return res.json({ success: true, projects: result });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: 'Something went wrong on the server side. '});
    }
});

// This views the members of one project
router.get('/:id/members', async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.json({ success: false, message: 'That project id isnt valid. '});
        }
        const project = await Project.findById(id);
        if (!project) {
            return res.json({ success: false, message: 'That project doesnt exist. '});
        }

        // This finds every membership for this project. And populate() swaps each user_id for the real user
        const memberships = await ProjectMembership.find({ project_id: id })
            .populate('user_id', 'f_name l_name username');

        // This builds the list that React will show, one entry per member
        const members = [];
        for (const membership of memberships) {
            const user = membership.user_id;
            members.push({
                user_id: user._id,
                f_name: user.f_name,
                l_name: user.l_name,
                username: user.username,
                // The .equals is how you can compare 2 MongoDB ids
                is_lead: user._id.equals(project.project_lead_id)
            });
        }
        return res.json({ success: true, members: members });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: 'Something went wrong on the server side. '});
    }
});

// This adds a member
// The React app will send: { user_id }
router.post('/:id/members', async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id } = req.body;

        if (!user_id) {
           return res.json({ success: false, message: 'Please select a user to add.'});
        }
        if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(user_id)) {
           return res.json({ success: false, message: 'That project or user id isnt valid.'});
        }

        const project = await Project.findById(id);
        if (!project) {
            return res.json({ success: false, message: 'That project doesnt exist.' });
        }
        const user = await User.findById(user_id);
        if (!user) {
            return res.json({ success: false, message: 'That user doesnt exist.' });
        }

        // This part checks if the user is already in this project or not
        const existingMembership = await ProjectMembership.findOne({ project_id: id, user_id: user_id });
        if (existingMembership) {
           return res.json({ success: false, message: user.username + ' is already a member of this project.' });
        }

        // This part saves the new membership in MongoDB
        const newMembership = new ProjectMembership({ project_id: id, user_id: user_id });
        await newMembership.save();

        return res.json({ success: true, message: user.username + ' was added to "' + project.name + '".' });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: 'Something went wrong on the server side.' });
    }
});

// This part removes a member
router.delete('/:id/members/:userId', async (req, res) => {
    try {
        const { id, userId } = req.params;

        if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(userId)) {
           return res.json({ success: false, message: 'That project or user id isnt valid.'});
        }

        const project = await Project.findById(id);
        if (!project) {
           return res.json({ success: false, message: 'That project doesnt exist.' });
        }
        const user = await User.findById(userId);
        if (!user) {
           return res.json({ success: false, message: 'That user doesnt exist.' });
        }

        // The project lead cant be removed
        if (project.project_lead_id.equals(userId)) {
           return res.json({ success: false, message: 'The project lead cant be removed from the project.' });
        }

        // We don't look at the story status, so completed stories can count also
        const assignedStory = await UserStory.findOne({ project_id: id, assigned_user_id: userId });
        if (assignedStory) {
            return res.json({ success: false, message: user.username + ' still has stories assigned in this project. Reassign, unassign, or delete those stories before removing this member.' });
        }

        const result = await ProjectMembership.deleteOne({ project_id: id, user_id: userId });
        if (result.deletedCount === 0) {
            return res.json({ success: false, message: user.username + ' is not a member of this project.' });
        }

        return res.json({ success: true, message: user.username + ' was removed from "' + project.name + '".' });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: 'Something went wrong on the server side.' });
    }
});

module.exports = router;