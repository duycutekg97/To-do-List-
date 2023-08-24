import express from "express";
import TaskController from "../controllers/taskController";

const router = express.Router();

router.post('/api/v1/create-stage', TaskController.handleCreateStage);
router.post('/api/v1/create-task', TaskController.handleCreateTask);
router.post('/api/v1/edit-stage', TaskController.handleEditStage);
router.delete('/api/v1/delete-stage', TaskController.handleDeleteStage);

module.exports = router;