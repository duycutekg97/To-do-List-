import { myDataSource } from "../config/connectDB"
import { Activity } from "../entity/Activity";
import { Project } from "../entity/Project"
import { Task, taskStatus } from "../entity/Task";
import { Stage } from "../entity/Stage";
import { User } from "../entity/User";
import moment from "moment";

const userRepository = myDataSource.getRepository(User)
const projectRepository = myDataSource.getRepository(Project);
const stageRepository = myDataSource.getRepository(Stage);
const activityRepository = myDataSource.getRepository(Activity);
const taskRepository = myDataSource.getRepository(Task);

export class DashboardServices {
    static dashboard = async (userId) => {
        const findUser = await userRepository.findOne({
            where: { userId: userId },
            relations: ['projects.users', 'projects.stages.tasks', 'project', 'project.users', 'tasks'],
            order: {
                projects: {
                    createAt: "DESC"
                }
            }
        })

        if (!findUser) {
            return ({
                message: `User doesn't exist!`,
                status: 200,
                data: [],
                error: null
            })
        }

        // all projects owned by the user with a list of participants in that project 
        let numberOfMember = 0;
        let listMember: string[] = [];
        if (findUser?.project.length !== 0) {
            findUser?.project.map((project) => {
                project.users.map((user) => {
                    listMember.push(user.email);
                })
            })

            let uniqueEmail = [...new Set(listMember)];
            numberOfMember = uniqueEmail.length;
        }

        let numberOfTask = 0;
        // user's project list
        let projectList: any[] = [];
        if (findUser.projects) {
            findUser.projects.map((project, index) => {
                let countTask = 0;
                if (project.stages) {
                    project.stages.map((stage, stageIndex) => {
                        if (stage.tasks) {
                            countTask += stage.tasks.length;
                            numberOfTask += stage.tasks.length;
                        }
                    })
                }
                let userList: Object[] = [];
                project.users.map((user, i) => {
                    userList.push({
                        userId: user.userId,
                        email: user.email
                    })
                })

                /* ************************/
                projectList.push({
                    projectId: project.projectId,
                    projectName: project.projectName,
                    deadline: project.deadline ? moment(project.deadline).add(7, 'h').format("DD/MM/YYYY") : null,
                    numberOfTask: countTask,
                    userList: userList
                });
            })
        }

        return {
            message: 'OK',
            status: 200,
            error: null,
            data: {
                numberOfProjects: findUser.projects.length,
                numberOfTasks: numberOfTask,
                numberOfMember: numberOfMember,
                projects: projectList,
                // listOfProject: findUser.projects
            }

        };
    }

    static dashboardOrderByNearestProject = async (userId) => {
        const findUser = await userRepository.findOne({
            where: { userId: userId },
            relations: ['projects.users', 'projects.stages.tasks', 'project', 'project.users', 'tasks'],
            order: {
                projects: {
                    deadline: {
                        direction: "ASC",
                        // nulls: "LAST"
                    }
                }
            }
        })

        // const findUser = await userRepository.createQueryBuilder("users")
        //     .where({ userId: userId })
        //     .leftJoinAndSelect("users.projects", "projects")
        //     .leftJoinAndSelect("projects.users", "users")
        // // .leftJoin('projects.stages.tasks', "tasks")
        // .leftJoinAndSelect('users.project', 'project')
        // // .leftJoin('project.users', 'pusers')
        // // .leftJoin('users.tasks', "utasks")
        // // .orderBy(``)
        // .getMany()

        if (!findUser) {
            return ({
                message: `User doesn't exist!`,
                status: 200,
                error: null,
                data: []
            })
        }

        //all projects owned by the user with a list of participants in that project 
        let numberOfMember = 0;
        let listMember: string[] = [];
        if (findUser?.project.length !== 0) {
            findUser?.project.map((project) => {
                project.users.map((user) => {
                    listMember.push(user.email);
                })
            })

            let uniqueEmail = [...new Set(listMember)];
            numberOfMember = uniqueEmail.length;
        }

        let numberOfTask = 0;
        // user's project list
        let projectList: any[] = [];
        if (findUser.projects) {
            findUser.projects.map((project, index) => {
                let countTask = 0;
                if (project.stages) {
                    project.stages.map((stage, stageIndex) => {
                        if (stage.tasks) {
                            countTask += stage.tasks.length;
                            numberOfTask += stage.tasks.length;
                        }
                    })
                }
                let userList: Object[] = [];
                project.users.map((user, i) => {
                    userList.push({
                        userId: user.userId,
                        email: user.email
                    })
                })

                /* ************************/
                projectList.push({
                    projectId: project.projectId,
                    projectName: project.projectName,
                    deadline: project.deadline ? moment(project.deadline).add(7, 'h').format("DD/MM/YYYY") : null,
                    numberOfTask: countTask,
                    userList: userList
                });
            })
        }

        return {
            message: 'OK',
            status: 200,
            error: null,
            data: {
                numberOfProjects: findUser.projects.length,
                numberOfTasks: numberOfTask,
                numberOfMember: numberOfMember,
                projects: projectList,
                // listOfProject: findUser.projects
            }
        };
    }

    static getUserProjects = async (userId) => {
        const findUser = await userRepository.findOne({
            where: { userId: userId },
            relations: ['projects', 'projects.stages.tasks', 'projects.stages.tasks.users'],
        });

        if (!findUser) {
            throw new Error(`User not found!`);
        }

        const projects = findUser.projects.map((project) => {
            const numberOfTasks = project.stages.reduce((total, stage) => total + stage.tasks.length, 0);
            const upcomingTasks = project.stages.flatMap((stage) => {
                return stage.tasks.filter((task) => {
                    return moment(task.deadline).isBefore(moment().add(7, 'days'));
                }).map((task) => {
                    // Tính số thành viên trong task
                    const numberOfMembers = task.users ? task.users.length : 0;
                    if (task.status === taskStatus.Processing && task.deadline < new Date()) {
                        task.status = taskStatus.Expired
                    }

                    taskRepository.save(task);

                    return {
                        taskId: task.taskId,
                        taskName: task.taskName,
                        deadline: moment(task.deadline).format("DD-MM-YYYY HH:mm:ss"),
                        status: task.status,
                        numberOfMembers: numberOfMembers,
                    };


                });
            });

            return {
                projectId: project.projectId,
                projectName: project.projectName,
                numberOfTasks: numberOfTasks,
                upcomingTasks: upcomingTasks,
            };
        });

        return projects;
    }

}