import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, ManyToOne, JoinColumn, ManyToMany, JoinTable } from "typeorm"
import { Stage } from "./Stage"
import { User } from "./User"

export enum taskStatus {
    Completed = 'completed',
    Processing = 'processing',
    Expired = 'expired'
}

@Entity()
export class Task extends BaseEntity {
    @PrimaryGeneratedColumn()
    taskId: number

    @Column()
    taskName: string

    @Column()
    description: string

    @Column({ type: "datetime", nullable: true})
    deadline: Date

    @Column({
        type: 'enum',
        enum: taskStatus,
        default: taskStatus.Processing
    })
    status: taskStatus

    @Column({ type: "timestamp" })
    createAt: Date

    @ManyToOne(() => Stage)
    @JoinColumn({ name: 'stageId' })
    stageId: Stage

    @ManyToMany(() => User,
        (user) => user.tasks)
    @JoinTable({
        name: 'user_task',
        joinColumn: {
            name: 'task_id',
            referencedColumnName: 'taskId',
        },
        inverseJoinColumn: {
            name: 'user_id',
            referencedColumnName: 'userId',
        },
    })
    users: User[]
}