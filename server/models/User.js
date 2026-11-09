const mongoose = require('mongoose');

// This part describes what a "user" would look like in our database.
// MongoDB automatically adds the _id field here
const userSchema = new mongoose.Schema({
    f_name: { type: String, required: true},
    l_name: { type: String, required: true},
    username: { type: String, required: true, unique: true }, // two users can't have the same username
    password: { type: String, required: true},
});

// This part turns the schema into a model we can use to
// find, create, and save any users in the "users" collection
module.exports = mongoose.model('User', userSchema);