
import { ILike } from "typeorm";
import { myDataSource } from "../config/connectDB"
import { Activity } from "../entity/Activity";
import { Project } from "../entity/Project";
import { User } from "../entity/User"
import { Notification } from "../entity/Notification";
import moment from "moment";

const userRepository = myDataSource.getRepository(User);
const projectRepository = myDataSource.getRepository(Project);
const activityRepository = myDataSource.getRepository(Activity);
const notificationRepository = myDataSource.getRepository(Notification);

export default class ProjectService {
    static createProject = async (userId, projectName) => {
        const findUser = await userRepository.findOne({
            where: { userId: userId },
            select: ['userId', 'email', 'firstName', 'lastName']
        })

        if (!findUser) {
            return ({
                status: 200,
                error: null,
                message: 'User does not exist!'
            })
        }

        let project = await projectRepository.create({
            projectName: projectName,
            createAt: new Date(),
            ownerId: userId
        });

        project.users = [findUser];
        let projectData = await projectRepository.save(project);

        let createActivity = new Activity();
        createActivity.activityName = findUser.firstName + ' ' + findUser.lastName + ' đã tạo dự án ' + projectName;
        createActivity.date = new Date();
        createActivity.projectId = project;

        await activityRepository.save(createActivity);

        let createNotification = new Notification();
        createNotification.notificationContent = 'Bạn đã tạo dự án ' + projectName;
        createNotification.createAt = new Date();
        createNotification.user = findUser;

        await notificationRepository.save(createNotification);

        return ({
            message: 'Create project successful!',
            status: 200,
            error: null,
            data: {
                projectId: projectData.projectId,
                projectName: projectData.projectName,
                createAt: moment(projectData.createAt).format("DD-MM-YYYY HH:mm:ss"),
                ownerId: projectData.ownerId,
                emailOwner: projectData.users[0].email,
                firstNameOwner: projectData.users[0].firstName,
                lastNameOwner: projectData.users[0].lastName,
            }
        })
    }

    static assignUserToProject = async (userId, projectId, listEmail) => {
        const findProject = await projectRepository.findOne({
            where: { projectId: projectId },
            relations: ['users', 'ownerId']
        });
        if (!findProject) {
            return ({
                status: 200,
                error: null,
                message: 'Project does not exist!'
            })
        }

        if (findProject.ownerId.userId != userId) {
            return ({
                status: 403,
                error: null,
                message: 'You are not the owner!'
            })
        }

        let listUserFail: string[] = [];
        let message = 'Assigning failed users!';

        for (let i = 0; i < listEmail.length; i++) {
            let findUser = await userRepository.findOneBy({ email: listEmail[i] });

            if (findUser) {
                let checkUser = findProject.users.find(user => user.email === listEmail[i]);
                if (!checkUser) {
                    findProject.users.push(findUser);
                    await projectRepository.save(findProject);
                    message = 'Assign user successful!';

                    let createNotification = await notificationRepository.create({
                        notificationContent: findProject.ownerId.firstName + ' ' + findProject.ownerId.lastName + ' đã thêm bạn vào dự án ' + findProject.projectName,
                        createAt: new Date(),
                        user: findUser
                    })

                    await notificationRepository.save(createNotification);
                }
                else {
                    listUserFail.push(listEmail[i]);
                }
            }
            else {
                listUserFail.push(listEmail[i]);
            }
        }

        return ({
            status: 200,
            error: null,
            message: message,
            fail: listUserFail
        })
    }

    static getAllProjectByUser = async (userId) => {
        const findUser = await userRepository.findOneBy({ userId: userId })

        if (!findUser) {
            return ({
                message: 'User does not exist!'
            })
        }

        const findAllProject = await userRepository.find({
            select: ['userId', 'email', 'firstName', 'lastName'],
            where: { userId: userId },
            relations: ['projects']
        })
        return ({
            message: 'OK',
            status: 200,
            error: null,
            data: findAllProject
        })
    }

    static editProject = async (projectId, userId, projectName) => {
        const findProject = await projectRepository.findOne({
            where: { projectId: projectId },
            relations: ['ownerId', 'users']
        })

        if (!findProject) {
            return {
                message: 'Project not found!'
            };
        }

        if (findProject.ownerId.userId !== parseInt(userId)) {
            return {
                message: 'You are not the owner of this project!'
            };
        }

        for (let i = 0; i < findProject.users.length; i++) {
            if (findProject.users[i].email === findProject.ownerId.email) {
                let createNotification = await notificationRepository.create({
                    notificationContent: 'Bạn đã đổi tên dự án ' + findProject.projectName + ' thành ' + projectName,
                    createAt: new Date(),
                    user: findProject.ownerId
                })

                await notificationRepository.save(createNotification);
            }
            else {
                let createNotification = await notificationRepository.create({
                    notificationContent: findProject.ownerId.firstName + ' ' + findProject.ownerId.lastName + ' đã đổi tên dự án ' + findProject.projectName + ' thành ' + projectName,
                    createAt: new Date(),
                    user: findProject.users[i]
                })

                await notificationRepository.save(createNotification);
            }
        }

        findProject.projectName = projectName;
        const updatedProject = await projectRepository.save(findProject);

        return {
            status: 200,
            error: null,
            message: 'Project updated successfully!',
            projectData: updatedProject
        };
    }

    static deleteProject = async (projectId, userId) => {
        const findProject = await projectRepository.findOne({
            where: { projectId: projectId },
            relations: ['ownerId', 'users']
        })

        if (!findProject) {
            return {
                message: 'Project not found!'
            };
        }

        if (findProject.ownerId.userId !== parseInt(userId)) {
            return {
                message: 'You are not the owner of this project!'
            };
        }

        for (let i = 0; i < findProject.users.length; i++) {
            if (findProject.users[i].email === findProject.ownerId.email) {
                let createNotification = await notificationRepository.create({
                    notificationContent: 'Bạn đã xóa dự án ' + findProject.projectName,
                    createAt: new Date(),
                    user: findProject.ownerId
                })

                await notificationRepository.save(createNotification);
            }
            else {
                let createNotification = await notificationRepository.create({
                    notificationContent: findProject.ownerId.firstName + ' ' + findProject.ownerId.lastName + ' đã xóa dự án ' + findProject.projectName,
                    createAt: new Date(),
                    user: findProject.users[i]
                })

                await notificationRepository.save(createNotification);
            }
        }

        await projectRepository.remove(findProject);

        return {
            status: 200,
            error: null,
            message: 'Project deleted successfully!'
        };
    }

    static getAllActivities = async () => {
        const allActivities = await activityRepository.find();
        return allActivities;
    };

    static getSixEarliestActivities = async () => {
        const sixEarliestActivities = await activityRepository.find({
            order: {
                date: "DESC",
            },
            take: 6,
        });
        return ({
            message: 'OK',
            data: sixEarliestActivities
        })
    };

    static getActivitiesByProjectId = async (projectId) => {
        const activitiesByProject = await activityRepository.find({
            where: {
                projectId: projectId,
            },
        });
        return activitiesByProject;
    };

    static findUser = async (keyword) => {
        const newKeyword = keyword.replace(/\s+/g, ' ').trim();

        const findUser = await userRepository.find({
            where: [
                {
                    email: ILike(`%${newKeyword}%`)
                },
                {
                    firstName: ILike(`%${newKeyword}%`)
                },
                {
                    lastName: ILike(`%${newKeyword}%`)
                }
            ],
            select: ['userId', 'email', 'firstName', 'lastName'],
            take: 6
        })

        return {
            message: 'OK',
            status: 200,
            error: null,
            findUser
        }
    }
}