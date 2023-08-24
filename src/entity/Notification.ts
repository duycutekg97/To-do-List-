import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, ManyToOne, JoinColumn } from "typeorm"
import { User } from "./User"

@Entity()
export class Notification extends BaseEntity {
    @PrimaryGeneratedColumn()
    notificationId: number

    @Column()
    notificationContent: string

    @Column({ type: "timestamp" })
    createAt: Date

    @ManyToOne(() => User,
        (user) => user.notifications)
    @JoinColumn({ name: 'userId' })
    user: User
}