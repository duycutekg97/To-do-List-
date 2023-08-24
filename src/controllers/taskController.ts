import { TaskServices } from "../services/taskServices"


export default class TaskController {
    static handleCreateStage = async (req, res, next) => {
        try {
            // #swagger.tags = ['Task']
            if (!req.query.userId || !req.query.projectId || !req.body.stageName) {
                return res.status(500).json({
                    message: 'Missing input parameter!',
                    status: 500,
                    error: 'Internal Server Error',
                })
            }

            const createStage = await TaskServices.createStage(req.query.userId, req.query.projectId, req.body.stageName);

            if (createStage.status === 403) {
                return res.status(403).json(createStage);
            }
            return res.status(200).json(createStage);
        } catch (e) {
            return res.status(500).json({
                message: e.message,
                status: 500,
                error: 'Internal Server Error',
            })
        }
    }

    static handleCreateTask = async (req, res, next) => {
        try {
            /*
            #swagger.tags = ['Task']
            #swagger.parameters['body'] = {
                in: 'body',
                description: 'Task Name là một trường bắt buộc',
                schema: {
                    $ref: '#/components/createTask'
                }
            }
            */
            if (!req.query.userId || !req.query.stageId || !req.body.taskName) {
                return res.status(500).json({
                    message: 'Missing input parameter!',
                    status: 500,
                    error: 'Internal Server Error',
                })
            }

            const createTask = await TaskServices.createTask(req.query.userId, req.query.stageId, req.body);
            if (createTask.status === 403) {
                return res.status(403).json(createTask);
            }

            return res.status(200).json(createTask);
        } catch (e) {
            return res.status(500).json({
                message: e.message,
                status: 500,
                error: 'Internal Server Error',
            })
        }
    }

    static handleEditStage = async (req, res, next) => {
        try {
            // #swagger.tags = ['Task']
            if (!req.query.userId || !req.query.stageId || !req.body.newStageName) {
                return res.status(500).json({
                    message: 'Missing input parameter!',
                    status: 500,
                    error: 'Internal Server Error',
                });
            }

            const editStage = await TaskServices.editStage(req.query.userId, req.query.stageId, req.body.newStageName);

            return res.status(200).json(editStage);
        } catch (e) {
            return res.status(500).json({
                message: e.message,
                status: 500,
                error: 'Internal Server Error',
            });
        }
    }

    static handleDeleteStage = async (req, res, next) => {
        try {
            // #swagger.tags = ['Task']
            if (!req.query.userId || !req.query.stageId) {
                return res.status(500).json({
                    message: 'Missing input parameter!',
                    status: 500,
                    error: 'Internal Server Error',
                });
            }

            const editStage = await TaskServices.deleteStage(req.query.userId, req.query.stageId);

            return res.status(200).json(editStage);
        } catch (e) {
            return res.status(500).json({
                message: e.message,
                status: 500,
                error: 'Internal Server Error',
            });
        }
    }
}