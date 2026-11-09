const mongoose = require('mongoose');

// One document = "This user is a member of this project"
// A user can appear in many memberships (many projects), and a project can appear
// in many memberships (many users). That's the many-to-many relationship
const projectMembershipSchema = new mongoose.Schema({
    project_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

module.exports = mongoose.model('ProjectMembership', projectMembershipSchema);