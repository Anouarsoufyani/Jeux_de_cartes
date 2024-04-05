import { ObjectId } from "@mikro-orm/mongodb";
import { DI, io } from "../app";
import { Game, Hand, User } from "../entities";

import { Card } from "./CardInterface";
import { CARD_POWERS } from "./CardPower";
import { CardIdentifiers } from "./CardType";

const getCardPower = (card: Card) => {
    return CARD_POWERS[card.identifiant as CardIdentifiers]
}


export const createHand = async (player: User, game: Game, cards: Card[]) => {
    cards.forEach(card => {
        card.user = player
    });
    const newHand = DI.em.create(Hand, {
        cards: cards,
        owner: player,
        game: game,
    });
    await DI.em.persistAndFlush(newHand);
    if (game && newHand) {
        game.gameHands = [...game.gameHands, newHand as Hand];
    }
};

// creation de main pour chaque joueur
export const createHandForAllPlayers = (players: User[], game: Game, paquet: Card[]) => {
    const nbDeCarteParJoueur = paquet.length / players.length;
    let compteur = 0;
    for (let j = 0; j < players.length; j++) {

        let paquetJoueur: Card[] = [];
        if (j == 0) {
            paquetJoueur = paquet.slice(0, nbDeCarteParJoueur);
        } else {
            paquetJoueur = paquet.slice(compteur, compteur + nbDeCarteParJoueur);

        }

        createHand(players[j], game, paquetJoueur); //paquet -> liste de carte
        compteur += nbDeCarteParJoueur;

    }
}

export const maxPuiss = (miseEnJeu: Card[]) => {
    let maxPower: Card = miseEnJeu[0];
    for (let i = 1; i < miseEnJeu.length; i++) {
        if (getCardPower(miseEnJeu[i]) > getCardPower(maxPower)) {
            maxPower = miseEnJeu[i];
        }
    }
    return maxPower;
}

export const chooseCard = (card: Card, miseEnjeu: Card[]) => {
    if (card.isUsable == true) {
        miseEnjeu.push(card);

    }
    else {
        console.log("La carte est non jouable");
    }
}

const nbOccurrences = (cards: Card[]) => {
    let max = 0;
    let cardMax: Card = cards[0];
    for (let i = 0; i < cards.length; i++) {
        let c = 0;
        cards.forEach(card => {
            if (getCardPower(cards[i]) == getCardPower(card)) {
                c++
            }
        });
        if (c > max) {
            max = c
            cardMax = cards[i]
        } else if (c == max) {
            if (getCardPower(cards[i]) > getCardPower(cardMax)) {
                max = c;
                cardMax = cards[i]
            }
        }
    }
    return cardMax
}

export const equivalentCard = (cards: Card[]) => {
    let eqCards: Card[] = [];
    let eqCards2: Card[] = [];
    cards.forEach(card => {
        // Vérifiez si une carte équivalente existe dans la liste
        if (cards.some(otherCard => otherCard.identifiant === card.identifiant)) {
            eqCards.push(card);
        }
    });

    let bataille = nbOccurrences(eqCards);


    cards.forEach(card => {

        if (card.identifiant == bataille.identifiant) {
            eqCards2.push(card)
        }
    });

    return eqCards2;
}

export const joueurGagnant = async (cards: Card[]) => {
    const maxPower: Card = maxPuiss(cards);

    return maxPower;
}









export const carre = async (miseEnJeuC: Card[], carte: Card, indiceMJ: number, userid: any, game: Game, indexMain: number) => {



    carte.user = undefined  //carte de l utilisateur dans la mise en jeu on enleve l utilisateur dla carte
    miseEnJeuC[indiceMJ].user = userid; //prochaine carte de l'utilisateur qui va se trouver dans sa main


    //Mise a jour de la main de l utilisateur avec nouvelle carte qui provient de la mise en jeu
    //Mise a jour de la mise en jeu avec la carte que l utilisateur a selectionné rajoute au meme endroit que la ou vient la carte selectionné au prealable
    let indiceOcc = 0
    for (let i = 0; i < game.gameHands.length; i++) {
        if (game.gameHands[i].owner?._id == userid) {

            game.gameHands[i].cards.splice(indexMain, 1);
            game.gameHands[i].cards.splice(indexMain,0,miseEnJeuC[indiceMJ])

            miseEnJeuC[indiceMJ] = carte
            indiceOcc = i

        }
    }

    io.emit("miseEnJeu", miseEnJeuC);

    let carteOcc = game.gameHands[indiceOcc].cards[0]//carte occurente dans la main du joueur
    let c = 1  //nb occurence dans la main du joueur
    let UserGagnant :any
    // recherche du nb d occurence dans la main du joueur 
    for (let j = 1; j < game.gameHands[indiceOcc].cards.length; j++) {
         
        if (game.gameHands[indiceOcc].cards[j].identifiant == carteOcc.identifiant) {
            c++
            
        }
    }

        if (c >= 4) {
        // console.log("carte res if",c);
        
            for (let k = 0; k < game.players.length; k++) {
                if (game.players[indiceOcc]._id == userid) {
                    UserGagnant = game.players[indiceOcc]   
                }
            }
            try {
                //ENSUITE POUR CHAQUE JOUEUR
                // console.log("Dans le try");

                for (const player of game.players) {
                  
                    if (player._id?.equals(UserGagnant._id as ObjectId)) {
                   
                        const userEntity = await DI.userRepository.findOne({
                            _id: UserGagnant._id
                          });
                        if (userEntity) {
                          
                            
                          //SINON AUGMENTER SA STAT DE VICTOIRE

                          userEntity.carreW++


                          await DI.userRepository.persistAndFlush(userEntity)
                        }
                    }
                    else{
                        //  SI LE JOUEUR A PERDU
                    const userEntity = await DI.userRepository.findOne({
                        _id: player._id
                      });
                    if (userEntity) {

                      //INCREMENTER SA STAT DE DEFAITE
                      
                      userEntity.carreL++;


                      await DI.userRepository.persistAndFlush(userEntity)
                    }
                    }
               
                }
                
              } catch (error) {
                // console.error("Erreur lors de la mise à jour de la main :", error);
              }


                io.emit("miseEnJeu", miseEnJeuC);
              
                io.emit("partieFinie", UserGagnant);
             
        }
    io.emit("miseEnJeu", miseEnJeuC);
        
    
   

    // le vainqueur est celui qui a une main entiere de meme carte 

}


export const createHandC = async (player: User, game: Game, cards: Card[]) => {

    cards.forEach(card => {
        card.user = player
    });



    const newHandC = DI.em.create(Hand, {
        cards: cards,
        owner: player,
        game: game,

    });

    await DI.em.persistAndFlush(newHandC);



    if (game && newHandC) {
        game.gameHands = [...game.gameHands, newHandC as Hand];
    }

};

export const createHandForAllPlayersC = (players: User[], game: Game, paquet: Card[]) => {
    const nbDeCarteParJoueur = 4;
    let compteur = 0;


    for (let j = 0; j < players.length; j++) {

        let paquetJoueur: Card[] = [];
        if (j == 0) {
            paquetJoueur = paquet.slice(0, nbDeCarteParJoueur);
        } else {
            paquetJoueur = paquet.slice(compteur, compteur + nbDeCarteParJoueur);

        }


        createHandC(players[j], game, paquetJoueur); //paquet -> liste de carte
        compteur += nbDeCarteParJoueur;


    }
}



export const trie = (cards: Card[]) => {
    cards.sort((a, b) => {
        let cardA = a; // Première carte de la sous-liste a
        let cardB = b; // Première carte de la sous-liste b

        // Remplacer 'value' par la propriété réelle de vos objets Card
        return cardA.numero - cardB.numero;
    });
}

export const resetMJ = (index: number, miseEnJeu: Card[][]) => {
    
    
    
    miseEnJeu[index].splice(0,5)
    io.emit("miseEnJeu", miseEnJeu);
    
    

    return miseEnJeu
}



export const isReset = (miseEnJeu: Card[][]) => {
    for (let i = 0; i < miseEnJeu.length; i++) {

        if (miseEnJeu[i].length >= 6) {
            
            
            return true
        }
    }
    return false
}

export const miseEnJeuIndex = (miseEnJeu: Card[][]) => {
    for (let i = 0; i < miseEnJeu.length; i++) {
        
        if (miseEnJeu[i].length >= 6) {
            
            return i
        }
    }
    
    
    return -1
}


export const dejaJoue = (listecartesJoue: Card[], cartes: Card[]) => {

    for (let i = 0; i < listecartesJoue.length; i++) {
        for (let j = 0; j < cartes.length; j++) {
            if (listecartesJoue[i].identifiant == cartes[0].identifiant) {
                cartes.splice(0, 1)
            }
        }
    }
    return cartes
}




const isInferieur = (ecart1: number, ecart2: number, ecart3: number, ecart4: number) => {
    if (ecart1 > 0 || ecart2 > 0 || ecart3 > 0 || ecart4 > 0) {


        return false;

    }


    return true

}

const indiceEcartmin = (ecartListe: number[], carte: Card, miseEnJeu: Card[][]) => {

    let ecartmin: number[] = []
    ecartListe.forEach(ecart => {
        if (ecart > 0) {
            ecartmin.push(ecart)
        }
    })
    
    let mini=ecartmin[0]
    for(let i=0;i<ecartmin.length;i++){
        if(mini>ecartmin[i]){
            mini = ecartmin[i]
        }
    }
    
    
    
    let indexEcart = ecartListe.indexOf(mini)

    miseEnJeu[indexEcart].push(carte)

    return miseEnJeu
}




export const Jboeuf = async (miseEnJeu: Card[][], cartes: any[]) => {
    

    trie(cartes)
    let fin = cartes.length
    let c = 0



    let ecartL1 = cartes[0].numero - miseEnJeu[0][miseEnJeu[0].length - 1].numero
    let ecartL2 = cartes[0].numero - miseEnJeu[1][miseEnJeu[1].length - 1].numero
    let ecartL3 = cartes[0].numero - miseEnJeu[2][miseEnJeu[2].length - 1].numero
    let ecartL4 = cartes[0].numero - miseEnJeu[3][miseEnJeu[3].length - 1].numero



    let ecartListe = [ecartL1, ecartL2, ecartL3, ecartL4]






    if (isInferieur(ecartL1, ecartL2, ecartL3, ecartL4)) {
        io.emit("doitChoisir", cartes[0].user)
        // io.emit("miseEnJeu", miseEnJeu);

    }

    else {
        while (fin != c) {



            miseEnJeu = indiceEcartmin(ecartListe, cartes[0], miseEnJeu)

            cartes.splice(0, 1);

            if (cartes.length > 0) {
                ecartL1 = cartes[0].numero - miseEnJeu[0][miseEnJeu[0].length - 1].numero
                ecartL2 = cartes[0].numero - miseEnJeu[1][miseEnJeu[1].length - 1].numero
                ecartL3 = cartes[0].numero - miseEnJeu[2][miseEnJeu[2].length - 1].numero
                ecartL4 = cartes[0].numero - miseEnJeu[3][miseEnJeu[3].length - 1].numero

                ecartListe = [ecartL1, ecartL2, ecartL3, ecartL4]
            }
            io.emit("miseEnJeu", miseEnJeu);

            c++



        }
    }
}

export const createHandBoeuf = async (player: User, game: Game, cards: Card[]) => {

    // const user = await DI.userRepository.findOne({
    //     _id: player._id,
    // })

    cards.forEach(card => {
        card.user = player
    });

    const newHand = DI.em.create(Hand, {
        cards: cards,
        owner: player,
        game: game,

    });

    await DI.em.persistAndFlush(newHand);

    if (game && newHand) {
        game.gameHands = [...game.gameHands, newHand as Hand];
    }

};


// creation de main pour chaque joueur
export const createHandForAllPlayersBoeuf = (players: User[], game: Game, paquet: Card[]) => {
    const nbDeCarteParJoueur = 10; 
    let compteur = 0;
    for (let j = 0; j < players.length; j++) {

        let paquetJoueur: Card[] = [];
        if (j == 0) {
            paquetJoueur = paquet.slice(0, nbDeCarteParJoueur);
        } else {
            paquetJoueur = paquet.slice(compteur, compteur + nbDeCarteParJoueur);

        }

        createHandBoeuf(players[j], game, paquetJoueur); //paquet -> liste de carte
        compteur += nbDeCarteParJoueur;

    }
}






