import { BeforeInsert, CreateDateColumn, Entity, Column, PrimaryGeneratedColumn, JoinTable, ManyToMany, BaseEntity, OneToMany } from "typeorm"
import { Project } from "./Project"
import { hash, bcrypt } from "bcryptjs";
import { Task } from "./Task"
import { Notification } from "./Notification";
const crypto = require("crypto");



@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    userId: number

    @Column({
        unique: true
    })
    email: string

    @Column()
    password: string

    @Column()
    firstName: string

    @Column({ nullable: true })
    lastName: string

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createAt: Date

    @Column({ nullable: true })
    public resetPasswordToken?: string

    @Column({ type: "datetime", nullable: true })
    public resetPasswordExpire?: Date | null

    @BeforeInsert()
    async hashPassword() {
        this.password = await hash(this.password, 12);
    }




    toResponse(): Partial<User> {
        const responseUser = new User();
        responseUser.userId = this.userId;
        responseUser.email = this.email;
        responseUser.firstName = this.firstName;
        responseUser.lastName = this.lastName;
        responseUser.password = this.password;

        return responseUser;
    }

    @ManyToMany(() => Project,
        (project) => project.users)
    @JoinTable({
        name: 'user_project',
        joinColumn: {
            name: 'user_id',
            referencedColumnName: 'userId',
        },
        inverseJoinColumn: {
            name: 'project_id',
            referencedColumnName: 'projectId',
        },
    })
    projects: Project[]

    @OneToMany(() => Project,
        (project) => project.ownerId)
    project: Project[]

    @ManyToMany(() => Task,
        (task) => task.users)
    tasks: Task[]

    @OneToMany(() => Notification,
        (notification) => notification.user)
    notifications: Notification[]
}