const express = require('express');
const User = require('../models/User');

const router = express.Router();

// Gets all the users
// The React dropdowns use this to let you pick a project lead or a new member
// We try to exclude the password so that it doesn't get sent to the browser
router.get('/', async (req, res) => {
    try {
        const users = await User.find().select('f_name l_name username');
        return res.json({ success: true, users: users })
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: 'Something went wrong on the server side.' });
    }
});

module.exports = router;