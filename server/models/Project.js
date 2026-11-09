const mongoose = require('mongoose');

// This is what a project would look like in the database
// The MongoDB adds the _id field by itself
const projectSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true},
    description: {type: String, required: true, trim: true},
    status: { type: String, required: true, enum: ['Planning', 'Active', 'Completed'] },
    // This is a ObjectId reference to a document in the users collection
    // We store this id (not the username) so that the link will survive even if there is a name change
    project_lead_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

module.exports = mongoose.model('Project', projectSchema);