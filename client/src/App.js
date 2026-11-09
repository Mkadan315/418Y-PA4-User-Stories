import React, { useState } from 'react';
import Signup from './components/Signup';
import Login from './components/Login';
import CreateProject from './components/CreateProject';
import ProjectList from './components/ProjectList';
import ProjectMembers from './components/ProjectMembers';
import ProjectBacklog from './components/ProjectBacklog';


// This is the main component which decides which screen to show based on which tab is clicked
// Only the selected screen will be rendered, so every time you switch tabs that screen will load
// fresh data from the backend side (that's why a new project shows up right away in the list).
function App() {
    // The page can be: 'login', 'signup', 'create', 'projects', or 'members'
    const [page, setPage] = useState('login');

    return (
        <div className="app">
            <h1>PA3 - Projects</h1>

            <div className = "tabs">
                <button onClick = {() => setPage('login')}>Log In</button>
                <button onClick = {() => setPage('signup')}>Sign Up</button>
                <button onClick = {() => setPage('create')}>Create Projects</button>
                <button onClick = {() => setPage('projects')}>Projects</button>
                <button onClick = {() => setPage('members')}>Members</button>
                <button onClick = {() => setPage('backlog')}>Backlog</button>
            </div>

            {page === 'login' && <Login />}
            {page === 'signup' && <Signup />}
            {page === 'create' && <CreateProject />}
            {page === 'projects' && <ProjectList />}
            {page === 'members' && <ProjectMembers />}
            {page === 'backlog' && <ProjectBacklog />}
        </div>
    );
}

export default App;