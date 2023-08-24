import { DashboardServices } from "../services/dashboardService"


export default class DashboardController {
    static handleDashboard = async (req, res, next) => {
        try {
            // #swagger.tags = ['Dashboard']
            if (!req.query.userId) {
                return res.status(500).json({
                    message: 'Missing input parameter!',
                    status: 500,
                    error: 'Internal Server Error',
                })
            }

            return res.status(200).json(await DashboardServices.dashboard(req.query.userId));
        } catch (e) {
            return res.status(500).json({
                message: e.message,
                status: 500,
                error: 'Internal Server Error',
            });
        }
    }

    static handleDashboardOrderByNearestProject = async (req, res, next) => {
        try {
            // #swagger.tags = ['Dashboard']
            if (!req.query.userId) {
                return res.status(500).json({
                    message: 'Missing input parameter!',
                    status: 500,
                    error: 'Internal Server Error',
                })
            }

            return res.status(200).json(await DashboardServices.dashboardOrderByNearestProject(req.query.userId));
        } catch (e) {
            return res.status(500).json({
                message: e.message,
                status: 500,
                error: 'Internal Server Error',
            });
        }
    }

    static handleGetUserProject = async (req, res, next) => {
        try {
            // #swagger.tags = ['Dashboard']
            if (!req.query.userId) {
                return res.status(500).json({
                    message: 'Missing input parameter!',
                    status: 500,
                    error: 'Internal Server Error',
                })
            }

            const projects = await DashboardServices.getUserProjects(req.query.userId);

            return res.status(200).json({
                message: 'OK',
                data: {
                    projects: projects,
                }
            });
        } catch (e) {
            return res.status(500).json({
                message: e.message,
                status: 500,
                error: 'Internal Server Error',
            });
        }
    }
}