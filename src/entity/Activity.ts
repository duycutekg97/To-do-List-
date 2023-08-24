import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, ManyToOne, JoinColumn } from "typeorm"
import { Project } from "./Project"

@Entity()
export class Activity extends BaseEntity {
    @PrimaryGeneratedColumn()
    activityId: number

    @Column()
    activityName: string

    @Column({ type: "timestamp" })
    date: Date

    @ManyToOne(() => Project,{onDelete: 'CASCADE'})
    @JoinColumn({ name: 'projectId' })
    projectId: Project
}