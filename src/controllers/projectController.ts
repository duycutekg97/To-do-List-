import ProjectService from "../services/projectService"


export default class ProjectController {
    static handleCreateProject = async (req, res, next) => {
        try {
            // #swagger.tags = ['Project']
            if (!req.query.userId || !req.body.projectName) {
                return res.status(500).json({
                    message: 'Missing input parameter!',
                    status: 500,
                    error: 'Internal Server Error',
                })
            }

            const createProject = await ProjectService.createProject(req.query.userId, req.body.projectName);
            return res.status(200).json(createProject)
        } catch (e) {
            return res.status(500).json({
                message: e.message,
                status: 500,
                error: 'Internal Server Error',
            })
        }
    }

    static handleAssignUserToProject = async (req, res, next) => {
        try {
            /*
            #swagger.tags = ['Project']
            #swagger.parameters['email'] = {
                in: 'body',
                description: 'Danh sách email các user được gán vào dự án',
                type: 'array',
                schema: {
                    $ref: '#/definitions/listUser'
                }
            }*/
            if (!req.query.userId || !req.query.projectId || !req.body.email) {
                return res.status(500).json({
                    message: 'Missing input parameter!',
                    status: 500,
                    error: 'Internal Server Error',
                })
            }
            const data = await ProjectService.assignUserToProject(req.query.userId, req.query.projectId, req.body.email)
            if (data.status === 403) {
                return res.status(403).json(data)
            }
            else {
                return res.status(200).json(data)
            }


        } catch (e) {
            return res.status(500).json({
                message: e.message,
                status: 500,
                error: 'Internal Server Error',
            })
        }
    }

    static handleGetAllProjectByUser = async (req, res, next) => {
        try {
            // #swagger.tags = ['Project']
            if (!req.query.userId) {
                return res.status(500).json({
                    message: 'Missing input parameter!',
                    status: 500,
                    error: 'Internal Server Error',
                })
            }

            const allProject = await ProjectService.getAllProjectByUser(req.query.userId);
            return res.status(200).json(allProject);
        } catch (e) {
            return res.status(500).json({
                message: e.message,
                status: 500,
                error: 'Internal Server Error',
            })
        }

    }

    static handleEditProject = async (req, res, next) => {
        try {
            // #swagger.tags = ['Project']
            if (!req.query.projectId || !req.body.projectName) {
                return res.status(500).json({
                    message: 'Missing input parameter!',
                    status: 500,
                    error: 'Internal Server Error',
                });
            }

            const projectId = req.query.projectId;
            const projectName = req.body.projectName;
            const userId = req.query.userId;

            const editProject = await ProjectService.editProject(projectId, userId, projectName);

            return res.status(200).json(editProject);
        } catch (e) {
            return res.status(500).json({
                message: e.message,
                status: 500,
                error: 'Internal Server Error',
            });
        }
    }

    static handleDeleteProject = async (req, res, next) => {
        try {
            // #swagger.tags = ['Project']
            if (!req.query.projectId || !req.query.userId) {
                return res.status(500).json({
                    message: 'Missing input parameter!',
                    status: 500,
                    error: 'Internal Server Error',
                });
            }

            const projectId = req.query.projectId;
            const userId = req.query.userId;

            const deleteProject = await ProjectService.deleteProject(projectId, userId);

            return res.status(200).json(deleteProject);
        } catch (e) {
            return res.status(500).json({
                message: e.message,
                status: 500,
                error: 'Internal Server Error',
            });
        }
    }

    static handleGetAllActivities = async (req, res, next) => {
        try {
            // #swagger.tags = ['Project']
            const allActivities = await ProjectService.getAllActivities();
            return res.status(200).json(allActivities);
        } catch (e) {
            return res.status(500).json({
                message: e.message,
                status: 500,
                error: 'Internal Server Error',
            });
        }
    };

    static handleGetSixEarliestActivities = async (req, res, next) => {
        try {
            // #swagger.tags = ['Project']
            const sixEarliestActivities = await ProjectService.getSixEarliestActivities();
            return res.status(200).json(sixEarliestActivities);
        } catch (e) {
            return res.status(500).json({
                message: e.message,
                status: 500,
                error: 'Internal Server Error',
            });
        }
    };

    static handleGetActivitiesByProjectId = async (req, res, next) => {
        try {
            // #swagger.tags = ['Project']
            if (!req.query.projectId) {
                return res.status(500).json({
                    message: 'Missing input parameter!',
                    status: 500,
                    error: 'Internal Server Error',
                });
            }


            const findEmail = await ProjectService.findUser(req.body.email);

            return res.status(200).json(findEmail)
        } catch (e) {
            return res.status(500).json({
                message: e.message,
                status: 500,
                error: 'Internal Server Error',
            })
        }
    }

    static handleFindUser = async (req, res, next) => {
        try {
            // #swagger.tags = ['Project']
            if (!req.body.email) {
                return res.status(500).json({
                    message: 'Missing input parameter!',
                    status: 500,
                    error: 'Internal Server Error',
                });
            }
            const projectId = req.query.projectId;
            const activitiesByProject = await ProjectService.getActivitiesByProjectId(projectId);
            return res.status(200).json(activitiesByProject);
        } catch (e) {
            return res.status(500).json({
                message: e.message,
                status: 500,
                error: 'Internal Server Error',
            });
        }
    };
}