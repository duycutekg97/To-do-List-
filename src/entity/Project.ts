import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, BaseEntity, ManyToOne, JoinColumn, OneToMany } from "typeorm"
import { User } from "./User"
import { Stage } from "./Stage"

@Entity()
export class Project extends BaseEntity {
    @PrimaryGeneratedColumn()
    projectId: number

    @Column()
    projectName: string

    @Column({ type: "timestamp" })
    createAt: Date

    @Column({type: "timestamp" , nullable: true})
    deadline: Date

    @ManyToMany(() => User,
        (user) => user.projects)
    users: User[]

    @ManyToOne(() => User,
        (user) => user.project)
    @JoinColumn({ name: 'ownerId' })
    ownerId: User

    @OneToMany(() => Stage,
        (stage) => stage.projectId)
    stages: Stage[]
}