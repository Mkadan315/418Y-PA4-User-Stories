import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';

// This is the first file that will run.
// It tells React to show our <App /> component inside the <div id="root"> in the index.html file
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);