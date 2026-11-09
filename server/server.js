require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const projectRoutes = require('./routes/projects');
const storyRoutes = require('./routes/stories');

const app = express();
const PORT = 5000;

// This is the address of the database
const MONGO_URI = process.env.MONGO_URI;
// This lets the React app (different port) talk to this server
app.use(cors());

// This lets us read the JSON sent from the frontend
app.use(express.json());

// All the signup and login routes are located here
app.use('/api/auth', authRoutes);

// This shows the list of users for the dropdowns and all the project + membership routes
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects', storyRoutes);

// This connects to the MongoDB first. and then starts to listen for any requests
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB!');
        app.listen(PORT, () => console.log('Server is running on port ' + PORT));
    })
    .catch((error) => {
        console.log('Could not connect to MongoDB:', error)
    });
