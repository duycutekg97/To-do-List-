import express from "express";
import ProjectController from "../controllers/projectController";

const router = express.Router();

router.post('/api/v1/create-project', ProjectController.handleCreateProject);
router.put('/api/v1/edit-project', ProjectController.handleEditProject);
router.delete('/api/v1/delete-project', ProjectController.handleDeleteProject);
router.post('/api/v1/assign-user-to-project', ProjectController.handleAssignUserToProject);
router.get('/api/v1/get-all-project-by-user', ProjectController.handleGetAllProjectByUser);
router.get('/api/v1/getAllActivity', ProjectController.handleGetAllActivities);
router.get('/api/v1/getTopSixActivity', ProjectController.handleGetSixEarliestActivities);
router.get('/api/v1/getActivitiesByProjectId', ProjectController.handleGetActivitiesByProjectId);

router.get('/api/v1/find-user', ProjectController.handleFindUser);

module.exports = router;