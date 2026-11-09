const express = require('express');
const User = require('../models/User');

const router = express.Router();

// SIGNUP
// The React app sends: { f_name, l_name, username, password }

router.post('/signup', async (req, res) => {
    try {
        const { f_name, l_name, username, password } = req.body;

        // This part makes sure that nothing is missing
        if (!f_name || !l_name || !username || !password) {
            return res.json({ success: false, message: 'Please fill out every field.' });
        }

        // This part checks if the username is already taken or not
        const existingUser = await User.findOne({ username: username});
        if (existingUser) {
            return res.json({ success: false, message: 'That username is already taken, try again.' });
        }

        // This part saves the new user in MongoDB
        const newUser = new User({ f_name, l_name, username, password });
        await newUser.save();

        return res.json({ success: true, message: 'Account has been made! You can now login.' });
    } catch (error) {
        console.log(error) // This is helpful when something goes wrong when testing
        return res.json({ success: false, message: 'Something went wrong on the server end.' });
    }
});

// LOGIN
// The React app sends { username, password }
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.json({ success: false, message: 'Please enter a username and password.' });
        }

        // Find the user by their username
        const user = await User.findOne({ username: username});
        if (!user) {
            return res.json({ success: false, message: 'There is no account with that username' });
        }

        // Makes sure the password matches
        if (user.password !== password) {
            return res.json({ success: false, message: 'Wrong password, try again.' });
        }

        // If the password matched
        return res.json({ success: true, message: 'You logged in successfully! Welcome back, ' + user.f_name + '!' });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: 'Something went wrong on the server end.' });
    }
})

module.exports = router;