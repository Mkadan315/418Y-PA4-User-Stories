# PA4 - User Stories and Project Backlog

# Name: Mathew Kadanthod

# Description

This builds on PA3 (Projects and Project Memberships). Each project now has a backlog of user stories. A story has a title, a description, a priority (High, Medium, Low), a status (To Do, In Progress, Done), and an assigned member (a member of that project, or Unassigned). Stories can be created, viewed, edited, and deleted. A member who still has stories assigned in a project cannot be removed from that project. The database has four collections: users, projects, projectmemberships, and userstories.

# Project Structure
PA4_Projects/
server/   Express + MongoDB backend
client/   React frontend
# How to Run this Application

You need Node.js installed and a MongoDB database (local or Atlas).

1. Start the backend

cd server
npm install
Create a file named .env in the server folder with: MONGO_URI=your_connection_string
npm start

You should see "Connected to MongoDB!" and "Server is running on port 5000".

2. Start the frontend (new terminal)

cd client
npm install
npm start

The app opens at http://localhost:3000

# How to Prepare Test Data
Sign Up at least three users.
Create Project: make two projects, each with a different Project Lead.
Members: add at least one non-lead member to each project. Make sure at least one user belongs to only one of the projects.
Backlog: select a project and click Add Story. Create at least five stories across the two projects, with all three priorities, some assigned and some Unassigned. New stories start as To Do, so use Edit to change some to In Progress or Done.
Try it out:
Assign a story only to a member of that project (other users do not appear in the dropdown).
On the Members tab, try to remove a member who has a story assigned in that project. It is refused with a message.
A member whose stories are only in the other project can still be removed.
Refresh the page. The stories are still there.
# How It Works
React (client/src/components): ProjectBacklog shows the stories of a selected project and has the create/edit form, the details view, and the delete button. It talks to the backend with axios and shows the message the backend returns.
Express (server/routes): stories.js handles the story routes, which are nested under the project (for example /api/projects/:projectId/stories/:storyId). It validates every request and answers failures with a status code (400, 404, 500) and a message. projects.js handles the PA3 project and member routes, including the new rule for removing a member.
MongoDB (server/models): UserStory stores project_id and assigned_user_id as ObjectId references (assigned_user_id is null for Unassigned).
Editing and deleting look the story up by its id AND its project id together, so a story can only be changed through its own project.
Assigning checks that the user exists and has a ProjectMembership for that same project.
Known Issues

Passwords are still stored as plain text (from PA2). There is no hashing.