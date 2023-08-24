import express from "express";
import UserController from "../controllers/userController";
import ProjectController from "../controllers/projectController";
import TaskController from "../controllers/taskController";

const route = express.Router();

let initWebRoutes = (app) => {
    // route.post('/api/insert-user', UserController.handleCreateUser);

    // route.post('/api/create-project', ProjectController.handleCreateProject);
    // route.post('/api/edit-project', ProjectController.handleEditProject);
    // route.post('/api/delete-project', ProjectController.handleDeleteProject);
    // route.post('/api/assign-user-to-project', ProjectController.handleAssignUserToProject);
    // route.get('/api/getAllProjectWithUser', ProjectController.handleGetAllProjectByUser);

    // route.post('/api/createTask', TaskController.handleCreateTask);
    // route.post('/api/createSmallTask', TaskController.handleCreateSmallTask);

    return app.use('/', route);
}

export {
    initWebRoutes
}