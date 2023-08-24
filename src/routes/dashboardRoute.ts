import express from "express";
import DashboardController from "../controllers/dashboardController";

const router = express.Router();

router.get('/api/v1/dashboard', DashboardController.handleDashboard);
router.get('/api/v1/dashboard-order-by-nearest-project', DashboardController.handleDashboardOrderByNearestProject);
router.get('/api/v1/dashboard-user-project', DashboardController.handleGetUserProject);


module.exports = router;