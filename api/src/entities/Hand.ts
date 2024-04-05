import {
    Entity,
    ManyToOne,
    PrimaryKey,
    Property,
} from "@mikro-orm/core";
import { ObjectId } from "@mikro-orm/mongodb";
import { Game } from "./Game";
import { User } from "./User";
import { Card } from "../services/CardInterface";



@Entity()
export class Hand {
    @PrimaryKey()
    _id: ObjectId | undefined;

    @Property({ type: "date" })
    createdAt = new Date();

    @Property({ type: "date", onUpdate: () => new Date() })
    updatedAt = new Date();

    @Property()
    cards!: Card[]

    @ManyToOne(() => User)
    owner: User | undefined;

    @ManyToOne(() => Game)
    game: Game | undefined;

}
