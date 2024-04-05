import { Request, Response } from "express";
import { DI, io } from "../../app";
import { Game, User } from "../../entities";
import uuid4 from "uuid4";
import startGameRequestDto from "./dtos/startGameRequestDto";
import { GameStatus } from "../../entities/GameStatus";
import { CardDeck } from "../../services/CardDeck";
import { Jboeuf, carre, createHandForAllPlayers, createHandForAllPlayersBoeuf, createHandForAllPlayersC, equivalentCard, isReset, joueurGagnant, miseEnJeuIndex, resetMJ } from "../../services/GameService";
import getMyGamesRequestDto from "./dtos/getMyGamesRequestDto";
import { Card } from "../../services/CardInterface";
import { ObjectId } from "@mikro-orm/mongodb";

export class GameController {
  static getAllGames = async (req: Request, res: Response) => {
    const currentUser = req.user;
    const games = await DI.gameRepository.findAll({
      owner: currentUser,
    });
    // await DI.gameRepository.removeAndFlush(games)
    return res.json({ games });
  };

  static getGame = async (req: Request, res: Response) => {
    const code = req.params.code;
    const game = await DI.gameRepository.findOne({
      code: code,
    });

    return res.json({ game });
  };

  static getMyGames = async (req: Request<getMyGamesRequestDto>, res: Response) => {
    const currentUser = req.user;


    const games = await DI.orm.em.find(Game, {
      owner: currentUser,  // Assurez-vous que votre entité Game a une relation nommée 'owner' avec l'entité User
    });

    return res.json({ games });
  };

  static getMyOngoingGames = async (req: Request<getMyGamesRequestDto>, res: Response) => {
    const currentUser = req.user;

    const Games = await DI.orm.em.find(Game, {
      status: GameStatus.STARTED
    });

    let games: any[] = [];
    Games.forEach(game => {
      for (const player of game.players) {

        if (player == currentUser) {
          games.push(game);
        }
      }
    });
    return res.json({ games });
  };

  static getMyCompletedGames = async (req: Request<getMyGamesRequestDto>, res: Response) => {
    const currentUser = req.user;

    const Games = await DI.orm.em.find(Game, {
      status: GameStatus.COMPLETED
    });

    let games: any[] = [];
    Games.forEach(game => {
      for (const player of game.players) {

        if (player == currentUser) {
          games.push(game);
        }
      }
    });
    return res.json({ games });
  };



  static createGame = async (req: Request, res: Response) => {

    const currentUser = req.user;
    const type = req.params.type;
    const newGame = DI.em.create(Game, {
      type: type,
      code: uuid4(),
      owner: currentUser,
      players: [currentUser],
      status: GameStatus.UNSTARTED
    });

    await DI.em.persistAndFlush(newGame);

    return res.json({ ...newGame });
  };


  static joinGame = async (req: Request, res: Response) => {

    const currentUser = req.user as User; // type correctly

    const userEntity = await DI.userRepository.findOne({
      _id: currentUser._id
    })

    const game = await DI.gameRepository.findOne({

      code: req.params.code
    })



    if (game && userEntity) {
      game.players = [...game.players, userEntity]
      await DI.em.persistAndFlush(game);
    } else {
      /// handle error
    }

    return res.json(game);

  }

  static startGameBataille = async (req: Request<startGameRequestDto>, res: Response) => {

    const currentUser = req.user as User; // type correctly

    //Selectionne une game précise où userEntity/currentUser est le propriétaire
    // et sélectionne la game avec son code unique
    const game = await DI.gameRepository.findOne({
      owner: currentUser,
      code: req.body.gameCode
    })

    if (game) {
      for (const player of game?.players) {
        const userEntity = await DI.userRepository.findOne({
          _id: player._id
        })

        if (userEntity) {
          userEntity.score = 0;
          await DI.em.persistAndFlush(userEntity);
          await DI.em.persistAndFlush(game);

        }
      }
    }

    if (game && game?.owner?._id === currentUser._id && game.players.length >= 2 && game.players.length <= 10) {
      game.status = GameStatus.STARTED;

      const cardDeck = new CardDeck();
      const paquet = cardDeck.deck;
      const paquetMelange = cardDeck.shuffleDeck(paquet);

      // CREER MAIN ET DISTRIB CARTES
      createHandForAllPlayers(game.players, game, paquetMelange);
      await DI.em.persistAndFlush(game);
      let cartes: Card[] = [];

      let nbJoueursConnectes: number = 0;
      let points: number = 0;
      let playersInBattle: User[] = [];
      let nbCartesRestantes: any[] = [];
      let handLength = 0;
      let cardUsername: any;
      let playersInBattleLength: number = 10;
      let listesMainsVides: any[] = [];

      io.on("connection", (socket) => {
        if (nbJoueursConnectes < game.players.length) {
          nbJoueursConnectes++;
        }

        io.emit("nbJoueurs", nbJoueursConnectes);

        // Écoutez la demande de la main
        socket.on("request_main", () => {
          // Émettez la main uniquement en réponse à la demand
          io.emit("main", { main: game.gameHands });

        });


        socket.on("sendCard", async (data) => {

          cartes.push(data.card);
          io.emit("miseEnJeu", [cartes])

          try {
            const userEntity = await DI.userRepository.findOne({
              _id: new ObjectId(data.userId)
            });

            for (const hand of game.gameHands) {
              if (hand.owner?._id && userEntity?._id && hand.owner._id.equals(userEntity._id)) {
                cardUsername = data.hand.cards[0].user.username;
                handLength = data.hand.cards.length;
                hand.cards = data.hand.cards;
                await DI.em.persistAndFlush(game);
              }
            }
          } catch (error) {
            // console.error("Erreur lors de la mise à jour de la main :", error);
          }

          if (cartes.length == nbJoueursConnectes || cartes.length == playersInBattleLength) {
            io.emit("miseEnJeu", [cartes])

            let cartesEquivalentes: Card[] = equivalentCard(cartes);

            cartesEquivalentes.forEach(card => {
              if (listesMainsVides.includes(card.user?.email)) {
                cartesEquivalentes.splice(cartesEquivalentes.indexOf(card), 1);
                nbJoueursConnectes = game.gameHands.length - listesMainsVides.length;
                io.emit("nbJoueurs", nbJoueursConnectes);
              }
            });
            if (cartesEquivalentes.length >= 2) {
              io.emit("miseEnJeu", [cartes])


              points += cartesEquivalentes.length - 1;



              io.emit("nvTour");
              playersInBattle = cartesEquivalentes.map(card => card.user).filter(user => user !== undefined) as User[];
              playersInBattleLength = playersInBattle.length
              io.emit("playersInBattle", { users: playersInBattle, cartes: cartesEquivalentes })
              cartes = [];
              io.emit("miseEnJeu", [cartes])
              // try {
              if (nbJoueursConnectes <= 1) {

                //PEUT ETRE METTRE LE CODE ICI
                io.emit("partieFinie");
              }

            } else {

              io.emit("miseEnJeu", [cartes])

              points += cartes.length - cartesEquivalentes.length;

              io.emit("nvTour");
              playersInBattleLength = nbJoueursConnectes;
              let carteGagnante = await joueurGagnant(cartes);



              try {
                const userEntity = await DI.userRepository.findOne({
                  _id: carteGagnante.user?.id
                });
                for (const player of game.players) {
                  if (player._id && userEntity?._id && player._id.equals(userEntity._id)) {
                    player.score += points;

                    await DI.em.persistAndFlush(game);
                    points = 0;

                    io.emit("updateScore", { players: game.players })

                  }

                }
              } catch (error) {
                // console.error("Erreur lors de la mise à jour de la main :", error);
              }

              io.emit("gagnant", { gagnant: carteGagnante.user, symbole: carteGagnante.symbole, identifiant: carteGagnante.identifiant });
              cartes = [];
              io.emit("miseEnJeu", [cartes])
              // try {
              if (nbJoueursConnectes <= 1) {


                // console.log("avant le persist");
                //SI PARTIE FINIE
                // RECUPERER L'ID DU GAGNANT
                let winner: any;
                let scoreMax: number = 0;
                for (const player of game.players) {
                  if (player.score > scoreMax) {
                    winner = player;
                    scoreMax = player.score
                  }
                }

                // console.log("le winner", winner);


                // io.emit("WinnerFinal", { winner: winner })

                try {
                  //ENSUITE POUR CHAQUE JOUEUR
                  // console.log("Dans le try");

                  for (const player of game.players) {
                    console.log("dans le for");

                    const userEntity = await DI.userRepository.findOne({
                      _id: player._id
                    });
                    // SI LE JOUEUR A PERDU
                    if (!player._id?.equals(winner._id)) {
                      if (userEntity) {
                        console.log("PERDANT");
                        console.log("dans bataille L");

                        //INCREMENTER SA STAT DE DEFAITE
                        userEntity.batailleL++;
                        await DI.userRepository.persistAndFlush(userEntity)
                      }
                    } else if (player._id?.equals(winner._id)) {
                      console.log("BON ID WINNER");

                      if (userEntity) {
                        console.log("dans bataille W");

                        //SINON AUGMENTER SA STAT DE VICTOIRE
                        userEntity.batailleW++
                        await DI.userRepository.persistAndFlush(userEntity)
                      }
                    }
                  }
                } catch (error) {
                  // console.error("Erreur lors de la mise à jour de la main :", error);
                }

                console.log("apres le bordel");
                io.emit("partieFinie", winner);
              }
            }
          }
          io.emit("miseEnJeu", [cartes])

          //RENVOIE LE NOMBRE DE CARTE DE CHAQUE USER
          const elementPresent = nbCartesRestantes.some((sousListe: any) => sousListe.includes(data.hand.cards[0].user.username));

          if (!elementPresent) {
            nbCartesRestantes.push([cardUsername, handLength]);
          } else {
            nbCartesRestantes.forEach((sousListe) => {
              if (sousListe.includes(cardUsername)) {
                sousListe[1] = handLength - 1;
                if (sousListe[1] == 0) {
                  if (!listesMainsVides.includes(!sousListe[0])) {
                    listesMainsVides.push(sousListe[0]);
                    nbJoueursConnectes--;

                    io.emit("nbJoueurs", nbJoueursConnectes);

                  }
                }
              }
            });
          }
          io.emit("nbCartesRestantes", nbCartesRestantes)
        })

        socket.on("updateHand", async (data) => {
          try {
            const userEntity = await DI.userRepository.findOne({
              _id: new ObjectId(data.userId)
            });

            for (const hand of game.gameHands) {
              if (hand.owner?._id && userEntity?._id && hand.owner._id.equals(userEntity._id)) {
                hand.cards = data.hand.cards;
                if (game.gameHands.length - listesMainsVides.length <= 1) {

                  game.status = GameStatus.COMPLETED;



                  await DI.em.persistAndFlush(game);

                }
                await DI.em.persistAndFlush(game);
              }
            }
          } catch (error) {
            // console.error("Erreur lors de la mise à jour de la main :", error);
          }


        });

        socket.on("disconnect", () => {

          nbJoueursConnectes--;
          io.emit("nbJoueurs", nbJoueursConnectes);
          io.emit("receive_message", { username: "MODERATION", message: "Un joueur a quitté la partie." });

        });
      });
    } else {
      return res.json("Joueurs insuffisants")
    }
    return res.json(game);
  }

  static startGameCarre = async (req: Request<startGameRequestDto>, res: Response) => {
    const currentUser = req.user as User; // type correctly

    //Selectionne une game précise où userEntity/currentUser est le propriétaire
    // et sélectionne la game avec son code unique
    const game = await DI.gameRepository.findOne({
      owner: currentUser,
      code: req.body.gameCode
    })

    if (game) {
      for (const player of game?.players) {
        const userEntity = await DI.userRepository.findOne({
          _id: player._id
        })

        if (userEntity) {
          userEntity.score = 0;
          await DI.em.persistAndFlush(userEntity);
          await DI.em.persistAndFlush(game);


        }
      }
    }

    if (game && game?.owner?._id === currentUser._id && game.players.length >= 2 && game.players.length <= 10) {
      game.status = GameStatus.STARTED;


      const cardDeckC = new CardDeck();
      const paquetC = cardDeckC.deck;
      const paquetMelangeC = cardDeckC.shuffleDeck(paquetC);
      let miseEnJeuC: any[] = [];

      for (let i = 0; i < 4; i++) {
        let card = paquetMelangeC.pop();
        if (card !== undefined) {
          miseEnJeuC.push(card);

        }
      }






      // CREER MAIN ET DISTRIB CARTES
      // createHandForAllPlayers(game.players, game, paquetMelange);
      // await DI.em.persistAndFlush(game);


      createHandForAllPlayersC(game.players, game, paquetMelangeC);
      await DI.em.persistAndFlush(game);

      let carte: Card;
      let indexMain: number;
      let userid: any;

      let nbJoueursConnectes: number = 0;
      let joueursClique = 0

      io.on("connection", (socket: any) => {
        nbJoueursConnectes++;
        io.emit("nbJoueurs", nbJoueursConnectes);

        // Écoutez la demande de la main
        socket.on("request_main", () => {
          io.emit("nbJoueurs", nbJoueursConnectes);
          // Émettez la main uniquement en réponse à la demand
          socket.emit("main", { main: game.gameHands });
        });

        io.emit("miseEnJeu", miseEnJeuC);


        //socket recu qd on le joueur clic sur une carte dans sa main
        socket.on("sendCard", (data: any) => {
          io.emit("nbJoueurs", nbJoueursConnectes);

          carte = data.card
          indexMain = data.indexMain
          userid = data.userid
          io.emit("enablePlay", userid)

          // io.emit("doitChoisir",userid)


          //socket recu qd le joueur clic sur une carte de MJ

        })
        socket.on("indice", (data2: any) => {
          io.emit("nbJoueurs", nbJoueursConnectes);

          carre(miseEnJeuC, carte, data2.indexMJ, data2.userid, game, indexMain)
          socket.emit("main", { main: game.gameHands });
          io.emit("miseEnJeu", miseEnJeuC);

        })

        socket.on("gameFin", async () => {
          try {


            game.status = GameStatus.COMPLETED

            await DI.gameRepository.persistAndFlush(game)
            console.log("bonjour");


          } catch (error) {

          }
        })


        socket.on("joueurClic", (data: any) => {
          joueursClique++

          if (joueursClique == nbJoueursConnectes) {
            for (let i = 0; i < 4; i++) {
              let elp = data.pop()
              let randIndex = Math.floor(Math.random() * paquetMelangeC.length);
              paquetMelangeC.splice(randIndex, 0, elp as Card);
            }


            // on ajoute la nouvelle MJ



            for (let i = 0; i < 4; i++) {
              let elp = paquetMelangeC.pop();
              data.push(elp)

            }

            joueursClique = 0

            miseEnJeuC = data
            io.emit("miseEnJeu", miseEnJeuC)
            io.emit("clictrue")

          }

          else {
            socket.emit("clicfalse")
          }
        })

        // socket.on("updateHand", async (data) => {
        //   try {
        //     const userEntity = await DI.userRepository.findOne({
        //       _id: new ObjectId(data.userId)
        //     });

        //     for (const hand of game.gameHands) {

        //       if (hand.owner?._id && userEntity?._id && hand.owner._id.equals(userEntity._id)) {
        //         hand.cards = data.hand.cards;
        //         await DI.em.persistAndFlush(game);
        //       }
        //     }
        //   } catch (error) {
        //     console.error("Erreur lors de la mise à jour de la main :", error);
        //   }
        // });

        socket.on("disconnect", () => {
          nbJoueursConnectes--;
          io.emit("nbJoueurs", nbJoueursConnectes);
        });
      });


    } else {
      return res.json("Joueurs insuffisants")
    }

    return res.json(game);

  }

  static startGameBoeuf = async (req: Request<startGameRequestDto>, res: Response) => {

    const currentUser = req.user as User; // type correctly

    //Selectionne une game précise où userEntity/currentUser est le propriétaire
    // et sélectionne la game avec son code unique
    const game = await DI.gameRepository.findOne({
      owner: currentUser,
      code: req.body.gameCode
    })

    if (game) {
      for (const player of game?.players) {
        const userEntity = await DI.userRepository.findOne({
          _id: player._id
        })

        if (userEntity) {
          userEntity.score = 0;
          await DI.em.persistAndFlush(userEntity);
          await DI.em.persistAndFlush(game);


        }
      }
    }

    if (game && game?.owner?._id === currentUser._id && game.players.length >= 2 && game.players.length <= 10) {
      game.status = GameStatus.STARTED;

      const cardDeck = new CardDeck();
      const paquet = cardDeck.deckBoeuf;
      const paquetMelange = cardDeck.shuffleDeck(paquet);

      let miseEnJeu: any[] = [];

      for (let i = 0; i < 4; i++) {
        let card = paquetMelange.pop();
        if (card !== undefined) {
          miseEnJeu.push([card]);
        }
      }





      // Fonction de comparaison pour trier les cartes
      miseEnJeu.sort((a, b) => {
        let cardA = a[0]; // Première carte de la sous-liste a
        let cardB = b[0]; // Première carte de la sous-liste b

        // Remplacer 'value' par la propriété réelle de vos objets Card
        return cardA.numero - cardB.numero;
      });





      // CREER MAIN ET DISTRIB CARTES
      createHandForAllPlayersBoeuf(game.players, game, paquetMelange);
      await DI.em.persistAndFlush(game);

      const cartes: Card[] = [];
      // let cartesDejaJoue : Card[] = []
      let nbJoueursConnectes: number = 0;



      let nbCartesRestantes: any[] = [];
      let handLength = 0;
      let cardUsername: any;
      let listesMainsVides: any[] = [];

      let CarteLG = 10

      let listescore: any[] = [];
      for (let player of game.players) {
        listescore.push([player, 0])
      }






      io.on("connection", (socket) => {
        if (game.players.length > nbJoueursConnectes) {
          nbJoueursConnectes++;
          for (let i = 0; i < listescore.length; i++) {

            io.emit("afficheScore", { score: listescore[i][1], userId: listescore[i][0].id })
          }


        }
        socket.emit("nbJoueurs", nbJoueursConnectes);

        // Écoutez la demande de la main
        socket.on("request_main", () => {


          // Émettez la main uniquement en réponse à la demand
          socket.emit("main", { main: game.gameHands });
        });

        io.emit("miseEnJeu", miseEnJeu);




        socket.on("sendCard", async (data) => {

          cartes.push(data.card);




          if (nbJoueursConnectes == cartes.length) {
            io.emit("miseEnJeu", miseEnJeu);

            Jboeuf(miseEnJeu, cartes)
            io.emit("miseEnJeu", miseEnJeu);




            if (isReset(miseEnJeu)) {
              let indexMJ = miseEnJeuIndex(miseEnJeu)

              let usercarte = miseEnJeu[indexMJ][5].user



              for (let m = 4; m >= 0; m--) {

                try {
                  if (data.userid != undefined) {
                    const userEntity = await DI.userRepository.findOne({
                      _id: new ObjectId(usercarte.id)
                    });

                    for (const player of game.players) {
                      if (player._id && userEntity?._id && player._id.equals(userEntity._id)) {
                        player.score += miseEnJeu[data.index][m].nbBoeuf;;

                        await DI.em.persistAndFlush(game);
                        io.emit("updateScore", { players: game.players })
                        if (player.score > 66) {


                          // console.log("avant le persist");
                          //SI PARTIE FINIE
                          // RECUPERER L'ID DU GAGNANT
                          let winner: any;
                          let scoreMax: number = 10000;
                          for (const player of game.players) {
                            if (player.score < scoreMax) {
                              winner = player;
                              scoreMax = player.score
                            }
                          }

                          try {
                            //ENSUITE POUR CHAQUE JOUEUR
                            // console.log("Dans le try");

                            for (const player of game.players) {

                              const userEntity = await DI.userRepository.findOne({
                                _id: player._id
                              });
                              // SI LE JOUEUR A PERDU
                              if (!player._id?.equals(winner._id)) {
                                if (userEntity) {


                                  //INCREMENTER SA STAT DE DEFAITE
                                  userEntity.boeufL++;
                                  await DI.userRepository.persistAndFlush(userEntity)
                                }
                              } else if (player._id?.equals(winner._id)) {

                                if (userEntity) {

                                  //SINON AUGMENTER SA STAT DE VICTOIRE
                                  userEntity.boeufW++
                                  await DI.userRepository.persistAndFlush(userEntity)
                                }
                              }
                            }
                          } catch (error) {
                            // console.error("Erreur lors de la mise à jour de la main :", error);
                          }

                          io.emit("partieFinie", winner);
                          game.status = GameStatus.COMPLETED;
                          await DI.em.persistAndFlush(game);


                        }
                      }
                    }
                  }
                }
                catch (error) {
                  // console.error("Erreur lors de la mise à jour de la main :", error);
                }


                // let liste = miseEnJeu[indexMJ]
                // for(let c=0;c<liste.length;c++){
                //   let carteP=liste.pop();
                //   let randIndex = Math.floor(Math.random() * paquetMelange.length);
                //   paquetMelange.splice(randIndex, 0, carteP);

                // }

                miseEnJeu = resetMJ(indexMJ, miseEnJeu)
                io.emit("miseEnJeu", miseEnJeu);

              }

              CarteLG--


              if (CarteLG == 0) {
                for (const hand of game.gameHands) {

                  hand.cards.splice(0, 10)
                  for (let i = 0; i < 10; i++) {

                    let card = paquetMelange.pop();
                    if (card) {
                      card.user = hand.owner;
                      hand.cards.push(card);
                    }
                  }
                  io.emit("mainMAJ", { hand: hand, userid: hand.owner?._id });
                }
                CarteLG = 10
              }
            }





            const elementPresent = nbCartesRestantes.some((sousListe: any) => sousListe.includes(data.hand.cards[0].user.username));

            if (!elementPresent) {
              nbCartesRestantes.push([cardUsername, handLength]);
            } else {
              nbCartesRestantes.forEach((sousListe) => {
                if (sousListe.includes(cardUsername)) {
                  sousListe[1] = handLength - 1;
                  if (sousListe[1] == 0) {
                    if (!listesMainsVides.includes(!sousListe[0])) {
                      listesMainsVides.push(sousListe[0]);
                      nbJoueursConnectes--;

                      io.emit("nbJoueurs", nbJoueursConnectes);

                    }
                  }
                }
              });
            }
          }
        })


        socket.on("choixLigne", async (data: any) => {

          for (let m = miseEnJeu[data.index].length - 1; m >= 0; m--) {
            try {
              if (data.userid != undefined) {
                const userEntity = await DI.userRepository.findOne({
                  _id: new ObjectId(data.userid)
                });


                for (const player of game.players) {
                  if (player._id && userEntity?._id && player._id.equals(userEntity._id)) {
                    player.score += miseEnJeu[data.index][m].nbBoeuf;;

                    await DI.em.persistAndFlush(game);
                    io.emit("updateScore", { players: game.players })
                    if (player.score > 66) {


                      // console.log("SCORE > 1");
                      //SI PARTIE FINIE
                      // RECUPERER L'ID DU GAGNANT
                      let winner: any;
                      let scoreMax: number = 10000;
                      for (const player of game.players) {
                        if (player.score < scoreMax) {
                          winner = player;
                          scoreMax = player.score
                        }
                      }

                      // console.log("WINNER", winner);


                      try {
                        //ENSUITE POUR CHAQUE JOUEUR
                        // console.log("Dans le try");
                        for (const player of game.players) {
                          // console.log("dans le for");

                          const userEntity = await DI.userRepository.findOne({
                            _id: player._id
                          });
                          // SI LE JOUEUR A PERDU
                          if (!player._id?.equals(winner._id)) {
                            if (userEntity) {
                              // console.log("PERDANT");
                              // console.log("dans boeuf L");

                              //INCREMENTER SA STAT DE DEFAITE
                              userEntity.boeufL++;
                              await DI.userRepository.persistAndFlush(userEntity)
                            }
                          } else if (player._id?.equals(winner._id)) {
                            // console.log("BON ID WINNER");

                            if (userEntity) {
                              // console.log("dans boeuf W");

                              //SINON AUGMENTER SA STAT DE VICTOIRE
                              userEntity.boeufW++
                              await DI.userRepository.persistAndFlush(userEntity)
                            }
                          }
                        }
                      } catch (error) {
                        // console.error("Erreur lors de la mise à jour de la main :", error);
                      }

                      // console.log("apres le bordel");
                      io.emit("partieFinie", winner);
                      game.status = GameStatus.COMPLETED;
                      await DI.em.persistAndFlush(game);
                    }
                  }
                }
              }
            }
            catch (error) {
              // console.error("Erreur lors de la mise à jour de la main :", error);
            }


            let carteP = miseEnJeu[data.index].pop();
            let randIndex = Math.floor(Math.random() * paquetMelange.length);
            paquetMelange.splice(randIndex, 0, carteP);


          }

          miseEnJeu[data.index].push(cartes[0])
          cartes.splice(0, 1)
          Jboeuf(miseEnJeu, cartes)
          io.emit("miseEnJeu", miseEnJeu);

        });




        socket.on("updateHand", async (data: any) => {

          try {
            const userEntity = await DI.userRepository.findOne({
              _id: new ObjectId(data.userId)
            });


            for (const hand of game.gameHands) {




              if (hand.owner?._id && userEntity?._id && hand.owner._id.equals(userEntity._id)) {
                hand.cards = data.hand.cards;

                await DI.em.persistAndFlush(game);
              }
            }
          } catch (error) {

          }
        });

        socket.on("disconnect", () => {
          nbJoueursConnectes--;
          socket.emit("nbJoueurs", nbJoueursConnectes);

        });
      });





    } else {
      return res.json("Joueurs insuffisants")
    }

    return res.json(game);

  }
}