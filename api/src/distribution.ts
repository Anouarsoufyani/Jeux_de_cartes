// class Player {
//     constructor(username, score) {
//         this.username = username;
//         this.score = score;
//         this.hand = [];
//     }

//     addCard(card) {
//         this.hand.push(card);
//     }

//     getHand() {
//         return this.hand;
//     }
// }

// class Card {

//     symbol: string
//     id: string

//     constructor(symbol: string, id) {
//         this.symbol = symbol;
//         this.id = id;
//     }
// }

// const CARD_POWERS = {
//     "AS": "AS",
//     "K": "K",
//     "Q": "Q",
//     "V": "V",
//     "DIX": "DIX",
//     "NEUF": "NEUF",
//     "HUIT": "HUIT",
//     "SEPT": "SEPT",
//     "SIX": "SIX",
//     "CINQ": "CINQ",
//     "QUATRE": "QUATRE",
//     "TROIS": "TROIS",
//     "DEUX": "DEUX"
// };

// const SYMBOLS = ["Coeur", "Carreau", "Pique", "Trèfle"];

// function generateDeck() {
//     const deck = [];
//     Object.keys(CARD_POWERS).forEach(identifier => {
//         SYMBOLS.forEach(symbol => {
//             deck.push(new Card(symbol, identifier));
//         });
//     });
//     return deck;
// }

// function shuffleDeck(deck) {
//     for (let i = deck.length - 1; i > 0; i--) {
//         const j = Math.floor(Math.random() * (i + 1));
//         [deck[i], deck[j]] = [deck[j], deck[i]];
//     }
//     return deck;
// }

// const distributeCards = (deck, players) => {
//     const cardsPerPlayer = Math.floor(deck.length / players.length);
//     players.forEach(player => {
//         for (let i = 0; i < cardsPerPlayer; i++) {
//             player.addCard(deck.pop());
//         }
//     });
// }

// // Exemple d'utilisation
// const deck = generateDeck();
// const shuffledDeck = shuffleDeck(deck);
// const players = [new Player("Joueur1", 0), new Player("Joueur2", 0)]; // Ajoutez plus de joueurs si nécessaire
// distributeCards(shuffledDeck, players);

// // Vérification de la distribution
// players.forEach(player => {
//     console.log(`${player.username} a ${player.getHand().length} cartes.`);
// });










// enum CardIdentifiers {
//     AS = "AS",
//     K = "K",
//     Q = "Q",
//     V = "V",
//     DIX = "DIX",
//     NEUF = "NEUF",
//     HUIT = "HUIT",
//     SEPT = "SEPT",
//     SIX = "SIX",
//     CINQ = "CINQ",
//     QUATRE = "QUATRE",
//     TROIS = "TROIS",
//     DEUX = "DEUX"
// }

// export class Player {
//     username: string;
//     score: number;
//     hand: Card[] = []

//     constructor(username: string, score: number) {
//         this.username = username;
//         this.score = score;
//     }

//     getUsername = () => {
//         return this.username;
//     }

//     addCard = (card: Card) => {
//         this.hand.push(card);
//     }

//     getHand = () => {
//         return this.hand;
//     }
// }

// // interface Joueur {
// //     username: PlayersName,
// //     score: number
// // }


// interface Card {
//     symbole: "Coeur" | "Trefle" | "Carreau" | "Pique",
//     identifiant: CardIdentifiers,
// }





