const mongoose = require('mongoose');

// This describes what a user story looks like in our database.
// MongoDB adds the _id field automatically
const userStorySchema = new mongoose.Schema({
    // Which project this story belongs to. It is set when the story is created and never changed.
    project_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true},
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    priority: { type: String, required: true, enum: ['High', 'Medium', 'Low'] },
    // A new story will always start as 'To Do'
    status: { type: String, required: true, enum: ['To Do', 'In Progress', 'Done'], default: 'To Do'},
    // The user working on the story, or null when the story is Unassigned
    assigned_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
});

module.exports = mongoose.model('UserStory', userStorySchema);