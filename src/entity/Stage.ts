import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, ManyToOne, JoinColumn, OneToMany } from "typeorm"
import { Project } from "./Project"
import { Task } from "./Task"

@Entity()
export class Stage extends BaseEntity {
    @PrimaryGeneratedColumn()
    stageId: number

    @Column()
    stageName: string

    @Column({ type: "timestamp" })
    createAt: Date

    @ManyToOne(() => Project)
    @JoinColumn({ name: 'projectId' })
    projectId: Project

    @OneToMany(() => Task,
        (task) => task.stageId)
    tasks: Task[]
}