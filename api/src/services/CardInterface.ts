// import { User } from "../entities";
import { CardIdentifiers } from "./CardType";

export interface Card {
    identifiant: CardIdentifiers,
    numero: number,
    nbBoeuf: number,
    symbole: "Coeur" | "Trefle" | "Carreau" | "Pique",
    user: any | undefined,
    isUsable: boolean
}