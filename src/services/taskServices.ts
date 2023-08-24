import { myDataSource } from "../config/connectDB"
import { Activity } from "../entity/Activity";
import { Project } from "../entity/Project"
import { Task } from "../entity/Task";
import { Stage } from "../entity/Stage";
import { User } from "../entity/User";
import moment from "moment";
import { Notification } from "../entity/Notification";

const userRepository = myDataSource.getRepository(User)
const projectRepository = myDataSource.getRepository(Project);
const stageRepository = myDataSource.getRepository(Stage);
const activityRepository = myDataSource.getRepository(Activity);
const taskRepository = myDataSource.getRepository(Task);
const notificationRepository = myDataSource.getRepository(Notification);

export class TaskServices {
    static createStage = async (userId, projectId, stageName) => {
        let findProject = await projectRepository.findOne({
            where: { projectId: projectId },
            relations: ['users'],
            select: {
                projectId: true,
                projectName: true,
                users: {
                    userId: true,
                    email: true,
                    firstName: true,
                    lastName: true
                }
            }
        });

        if (!findProject) {
            return ({
                message: `Project doesn't exist!`,
                status: 200,
                error: null,
            })
        }

        for (let i = 0; i < findProject.users.length; i++) {
            if (findProject.users[i].userId == userId) {
                let createStage = await stageRepository.create({
                    stageName: stageName,
                    createAt: new Date()
                });

                createStage.projectId = findProject;
                await stageRepository.save(createStage);

                let createActivity = new Activity();
                const fname = findProject.users[i].firstName;
                const lname = findProject.users[i].lastName ? findProject.users[i].lastName : '';
                createActivity.activityName = fname + ' ' + lname + ' đã tạo stage ' + stageName + ' trong dự án ' + findProject.projectName;
                createActivity.date = new Date();
                createActivity.projectId = findProject;

                await activityRepository.save(createActivity);

                findProject.users.length = 0;

                return {
                    message: 'Create stage successful!',
                    status: 200,
                    error: null,
                    data: createStage
                }
            }
        }

        return {
            status: 403,
            error: null,
            message: `User doesn't exist in project!`
        }
    }

    static createTask = async (userId, stageId, body) => {
        const findProject = await stageRepository.findOne({
            where: { stageId: stageId },
            relations: ['projectId', 'projectId.users']
        })

        if (!findProject) {
            return ({
                status: 200,
                error: null,
                message: `Stage doesn't exist!`
            })
        }

        if (!findProject.projectId) {
            return ({
                status: 200,
                error: null,
                message: `Project doesn't exist!`
            })
        }

        let users = findProject.projectId.users;
        for (let i = 0; i < users.length; i++) {
            if (users[i].userId == userId) {
                let createTask = await taskRepository.create({
                    taskName: body.taskName,
                    description: body.description,
                    deadline: body.deadline,
                    createAt: new Date()
                });

                if (body.deadline) {
                    if (!findProject.projectId.deadline || moment(findProject.projectId.deadline).format('YYYY-MM-DD HH:MM:SS') < body.deadline) {
                        findProject.projectId.deadline = body.deadline
                    }
                }
                await projectRepository.save(findProject.projectId);

                createTask.stageId = findProject;
                let listFailEmail: string[] = [];
                let listSuccessEmail: User[] = [];

                if (body.email) {
                    for (let j = 0; j < body.email.length; j++) {
                        for (let t = 0; t < users.length; t++) {
                            if (users[t].email == body.email[j]) {
                                listSuccessEmail.push(users[t]);
                                break;
                            }
                            if (t === users.length - 1) {
                                listFailEmail.push(body.email[j]);
                            }
                        }
                    }
                }

                if (listSuccessEmail) {
                    createTask.users = listSuccessEmail;
                }

                await taskRepository.save(createTask);

                let createActivity = new Activity();
                const fnameCreate = users[i].firstName;
                const lnameCreate = users[i].lastName;
                createActivity.activityName = fnameCreate + ' ' + lnameCreate + ' đã tạo task "' + body.taskName + '" trong dự án "' + findProject.projectId.projectName + '"';
                createActivity.date = createTask.createAt;
                createActivity.projectId = findProject.projectId;

                await activityRepository.save(createActivity);

                if (listSuccessEmail.length !== 0) {
                    let createAssignActivity = new Activity();
                    let content = '';
                    if (listSuccessEmail.length === 1) {
                        content += listSuccessEmail[0].email
                    }
                    else {
                        listSuccessEmail.map((item, index) => {
                            if (index === 0) {
                                content += item.email;
                            }
                            else if (index === listSuccessEmail.length - 1) {
                                content += ' và ' + item.email;
                            }
                            else {
                                content += ', ' + item.email;
                            }
                        })
                    }

                    createAssignActivity.activityName = fnameCreate + ' ' + lnameCreate + ' đã thêm "' + content + '" vào task "' + body.taskName + '" của dự án "' + findProject.projectId.projectName + '"';
                    createAssignActivity.date = createTask.createAt;
                    createAssignActivity.projectId = findProject.projectId;

                    await activityRepository.save(createAssignActivity);
                }

                if (listSuccessEmail.length !== 0) {
                    for (let j = 0; j < listSuccessEmail.length; j++) {
                        if (listSuccessEmail[j].userId === users[i].userId) {
                            let createNotification = await notificationRepository.create({
                                notificationContent: 'Bạn đã được thêm vào task ' + body.taskName + ' trong dự án ' + findProject.projectId.projectName,
                                createAt: new Date(),
                                user: listSuccessEmail[j]
                            })

                            await notificationRepository.save(createNotification);
                        }
                        else {
                            let createNotification = await notificationRepository.create({
                                notificationContent: users[i].firstName + ' ' + users[i].lastName + ' đã thêm bạn vào task ' + body.taskName + ' trong dự án ' + findProject.projectId.projectName,
                                createAt: new Date(),
                                user: listSuccessEmail[j]
                            })

                            await notificationRepository.save(createNotification);
                        }
                    }
                }


                findProject.projectId.users.length = 0;

                return ({
                    message: 'Create task successful!',
                    status: 200,
                    error: null,
                    data: {
                        taskName: createTask.taskName,
                        description: createTask.description,
                        deadline: moment(createTask.deadline).format("DD-MM-YYYY HH:mm:ss"),
                        taskId: createTask.taskId,
                        status: createTask.status,
                        createAt: moment(createTask.createAt).format("DD-MM-YYYY HH:mm:ss"),
                        stageId: createTask.stageId.stageId,
                        stageName: createTask.stageId.stageName,
                        fail: listFailEmail
                    }
                })
            }
        }

        return {
            status: 403,
            error: null,
            message: `User doesn't exist in project!`
        }
    }

    static editStage = async (userId, stageId, newStageName) => {

        const stage = await stageRepository.findOne({
            where: { stageId: stageId },
            relations: ['projectId', 'projectId.users']
        });

        if (!stage) {
            return {
                message: `Task doesn't exist!`
            };
        }

        let userInProject = stage.projectId.users.find(user => user.userId === parseInt(userId));
        if (!userInProject) {
            return {
                message: `User doesn't exist in project!`
            };
        }

        const oldStageName = stage.stageName;

        stage.stageName = newStageName;
        await stageRepository.save(stage);

        // Tạo activity và lưu vào cơ sở dữ liệu
        let activity = new Activity();
        const userName = userInProject.firstName + ' ' + userInProject.lastName;
        activity.activityName = userName + ' đã chỉnh sửa task từ "' + oldStageName + '" thành "' + newStageName + '" trong dự án "' + stage.projectId.projectName + '"';
        activity.date = new Date();
        activity.projectId = stage.projectId;

        await activityRepository.save(activity);

        return {
            message: 'Edit task successful!',
            stageId: stage.stageId,
            stageName: stage.stageName,
            projectName: stage.projectId.projectName,
            editedBy: userName,
            editActivity: activity.activityName,
            editTime: activity.date
        };
    };

    static deleteStage = async (userId, stageId) => {
        const stage = await stageRepository.findOne({
            where: { stageId: stageId },
            relations: ['projectId', 'projectId.users']
        });

        if (!stage) {
            return {
                message: `Stage doesn't exist!`
            };
        }

        let userInProject = stage.projectId.users.find(user => user.userId === parseInt(userId));
        if (!userInProject) {
            return {
                message: `User doesn't exist in project!`
            };
        }

        // Tạo activity và lưu vào cơ sở dữ liệu
        let activity = new Activity();
        const userName = userInProject.firstName + ' ' + userInProject.lastName;
        activity.activityName = userName + ' đã xóa stage "' + stage.stageName + '" trong dự án "' + stage.projectId.projectName + '"';
        activity.date = new Date();
        activity.projectId = stage.projectId;

        await activityRepository.save(activity);


        await stageRepository.delete(stageId);

        return {
            status: 200,
            error: null,
            message: 'Delete stage successful!',
        };
    };
}