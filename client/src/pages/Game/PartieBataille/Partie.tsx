/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './PartieBataille.css';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';

const socket = io('http://localhost:8080/');



const Partie: React.FC = () => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<{ username: string; message: string }[]>([]);
    const [main, setMain] = useState<any>({ cards: [] });
    const [miseEnJeu, setMiseEnJeu] = useState<any>();
    const [nbJoueurs, setNbJoueurs] = useState<any>();
    const [generated, setGenerated] = useState<any>(false);
    const [choisi, setChoisi] = useState<any>(false);
    const [fini, setFini] = useState<any>(false);
    const [partieFinie, setPartieFinie] = useState<any>(false);
    const [isBataille, setIsBataille] = useState<any>(false);
    const [choixLigne, setChoixLigne] = useState<any>(false);
    const [compteur, setCompteur] = useState<number>(0);
    const [nbTours, setNbTours] = useState<number>(0);
    const [score, setScore] = useState<any>();
    const [GOAT, setGOAT] = useState<any>();
    const [reglesDuJeuOuverts, setReglesDuJeuOuverts] = useState(false);


    const inputRef = useRef<HTMLInputElement | null>(null);



    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('Message', message);
        socket.emit('send_message', { username: user.username, message });
        setMessage('');  // Met à jour l'état pour vider l'input
    };

    useEffect(() => {
        socket.on("nbJoueurs", data => {
            setNbJoueurs(data);
            // console.log({ nbJoueurs: data });
        });
    })


    useEffect(() => {
        socket.on("doitChoisir", data => {
            // console.log(data);
            const user = JSON.parse(localStorage.getItem('user') || '{}');

            if (data.id == user.id) {
                setChoixLigne(true);
                // console.log(choixLigne);
            }
        });
        return () => {
            socket.off('doitChoisir');
        };
    })


    useEffect(() => {
        socket.on("miseEnJeu", data => {
            // console.log(data);

            setMiseEnJeu(data);
        });

        return () => {
            socket.off('miseEnJeu');
        };
    }, [])

    useEffect(() => {
        socket.on("partieFinie", (data: any) => {
            setPartieFinie(true);
            setGOAT(data)
            console.log("T'es a ton prime", data.username);

            localStorage.removeItem("nbcartesrestantes")
            // console.log("2");
        });

        return () => {
            socket.off('partieFinie');
        };
    }, [])


    useEffect(() => {
        socket.on("gagnant", data => {
            console.log(data);
            localStorage.setItem("symbole", JSON.stringify(data.symbole))
            localStorage.setItem("identifiant", JSON.stringify(data.identifiant))
            localStorage.setItem("gagnant", JSON.stringify(data.gagnant))
            setFini(true);
            setChoisi(false);
            setIsBataille(false)

            // console.log(fini);

        });

        return () => {
            socket.off('gagnant');
        };
    }, [fini])



    useEffect(() => {
        socket.on('receive_message', (data) => {
            setMessages((prevMessages) => [...prevMessages, data]);
        });

        return () => {
            socket.off('receive_message');
        };
    }, []);

    useEffect(() => {
        socket.on('playersInBattle', (data: any) => {
            // localStorage.setItem("isbataille", "true");
            setIsBataille(true)
            // console.log("DATA", data);
            localStorage.setItem("bataille", JSON.stringify(data.users));
            // console.log("BATAILLE", localStorage.getItem("bataille"));
            data.users.forEach((player: any) => {
                // console.log("DAnS FOR");
                localStorage.setItem("cartesEnBataille", JSON.stringify(data.cartes));
                if (player.id == JSON.parse(localStorage.getItem("user") || '{}').id as string) {
                    // console.log("DANS IF");
                    setChoisi(false)
                }
            });
        });
        return () => {
            socket.off('playersInBattle');
        };
    }, []);

    useEffect(() => {
        const userId = JSON.parse(localStorage.getItem('user') || '{}').id;

        socket.emit("request_main");

        const handleMainUpdate = (data: any) => {
            data.main.forEach((main: any) => {
                if (main.cards.length == 0 && main.owner == userId) {
                    socket.emit("generateNewPack", userId)
                    setCompteur(compteur + 1);
                    // console.log(compteur);
                } else {
                    setCompteur(0);
                }
            });

            if (compteur != 0) {
                socket.emit("generateNewPack", userId)
                window.location.reload();
            }

            const mainUser = data.main.filter((item: any) => item.owner == userId)

            setMain(mainUser[0]);
        };

        socket.on('main', handleMainUpdate);

        return () => {
            socket.off('main', handleMainUpdate);
        };
    }, []);


    useEffect(() => {
        socket.on("CestFini", data => {
            setFini(true);
            console.log({ winner: data });

        })
    })


    useEffect(() => {

        socket.on("nvTour", () => {
            setFini(false);
            setNbTours(nbTours + 1)

        })
    })

    useEffect(() => {
        const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
        socket.on("updateScore", (data: any) => {
            console.log(data);
            for (const player of data.players) {
                if (player.id == userId) {
                    console.log(`SCORE DE ${player.username}`, player.score);
                    setScore(player.score)
                }
            }
        })
    }, []);

    useEffect(() => {

        socket.on("nbCartesRestantes", (data) => {
            const jsonData = JSON.stringify(data);
            localStorage.setItem("nbcartesrestantes", jsonData)
            // console.log("LAKZKOZKZ", JSON.parse(localStorage.getItem("nbcartesrestantes") || ''));
            // JSON.parse(localStorage.getItem("nbcartesrestantes") || '').forEach((el: any) => {
            //     console.log("el", el);

            // })
        })

        return () => {
            socket.off('nbCartesRestantes');
        };
    })


    // Utilisez un autre useEffect pour observer les changements dans `main` et émettre l'événement 'updateHand'
    useEffect(() => {
        if (main && generated) {
            const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
            setChoisi(true);

            socket.emit("updateHand", { hand: main, userId: userId });
        }
        else if (main && main.cards.length >= 0) {
            const userId = JSON.parse(localStorage.getItem('user') || '{}').id;

            socket.emit("updateHand", { hand: main, userId: userId });
        }


    }, [main, generated]);

    const submitCard = (card: any) => {
        const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
        if (!choisi && !choixLigne) {
            setGenerated(true);
            // console.log({ card: card });


            socket.emit('sendCard', { card: card, userId: userId, hand: main });



            setMain((prevMain: any) => {
                // Filtrer la carte du tableau des cartes
                const updatedCards = prevMain.cards.filter((c: any) => c !== card);

                // Retourner un nouvel objet "main" avec les cartes mises à jour
                return { ...prevMain, cards: updatedCards };
            });
        } else if (choisi) {
            // console.log({ main: main });

            socket.emit("updateHand", { hand: main, userId: userId });
        }
    };

    const afficheRegles = () => {
        if (reglesDuJeuOuverts) {
            setReglesDuJeuOuverts(false);

        } else {
            setReglesDuJeuOuverts(true);

        }
    };



    return (
        <>
            <div className={reglesDuJeuOuverts ? 'reglesOuverts reglesDujeu' : 'reglesFermes reglesDujeu'}>
                <h2>Règles du jeu :</h2>
                <p>Règle 1: A chaque tour, chaque joueur retourne une carte.</p>
                <p>Règle 2: Le joueur qui dévoile la carte ayant la plus haute valeur emporte le round.</p>
                <p>Règle 3: Les valeurs des cartes sont : dans l’ordre de la plus forte à la plus faible : As, Roi, Dame, Valet, 10, 9, 8, 7, 6, 5, 4, 3 et 2</p>
                <p>Règle BATAILLE : Si deux cartes sont de même valeur, il y a « bataille ».

                    Les joueurs posent alors une carte, suivie d’une deuxième carte.
                    Recommencer l’opération s’il y a de nouveau une bataille.
                    Le joueur ayant la valeur la plus forte emporte le round !
                </p>
                <p> Règle de Fin du jeu : La partie prend fin lorsque tous les utilisateurs n'ont plus de cartes dans leurs mains. Le vainqueur sera celui qui aura remporté le plus de round</p>
            </div>
            <main id='game'>
                <section id="game_container">
                    <>
                        {partieFinie ? (
                            <>
                                <div id='goat_panel'>
                                    <span>la partie est finie</span>
                                    <p>MOOOOONSTRE</p>
                                    <p>Le gagnant est : {GOAT.username} </p>
                                    <p>Masterclass, T'es à ton prime {GOAT.username}</p>
                                    <p>T'as gagné avec  {GOAT.score} points</p>
                                    <a href="/">aller barre toi de là</a>
                                </div>

                            </>
                        ) : (
                            <>
                                <div className="game">
                                    <div id='statGame'>
                                        <div id='miniStatDiv'>
                                            <div className='miniStat'>Nombre de tours : {nbTours}</div>
                                            {localStorage.getItem("nbcartesrestantes") != undefined ? (
                                                <>
                                                    {JSON.parse(localStorage.getItem("nbcartesrestantes") || '').map((element: any, index: number) => (
                                                        <div className='miniStat' key={index}>
                                                            <li>{element[0]} possède {element[1]} cartes</li>
                                                        </div>
                                                    ))}
                                                </>
                                            ) : (
                                                <></>
                                            )}

                                        </div>
                                        <div id='tourStatDiv'>
                                            {fini ? (
                                                <>
                                                    <div className='tourStat'>Fin du tour</div>
                                                    <div className='tourStat'>Le gagnant est : <b>{JSON.parse(localStorage.getItem('gagnant') as string).username}</b></div>
                                                </>
                                            ) : (
                                                <></>
                                            )}

                                            {isBataille ? (
                                                <>
                                                    <div className='tourStat'>Bataille entre {JSON.parse(localStorage.getItem("bataille") || '{}').map((player: any) => player.username).join(', ')}</div>
                                                </>
                                            ) : (
                                                <></>
                                            )}
                                        </div>
                                        <div id='scoreStatDiv'>
                                            {
                                                score ? (
                                                    <>
                                                        <p>Votre score : {score}</p>
                                                    </>

                                                ) : (
                                                    <>
                                                        <p>Votre score : 0</p>
                                                    </>
                                                )
                                            }
                                        </div>
                                    </div>

                                    {fini ? (
                                        <>
                                            {/* <span>Le tour est finie</span>
                                            <p>Le gagnant est : {JSON.parse(localStorage.getItem('gagnant') as string).username}</p> */}
                                            <img className="carteGagnante" src={`/cards/${JSON.parse(localStorage.getItem('identifiant') as string)}_${JSON.parse(localStorage.getItem('symbole') as string)}.gif`} />
                                        </>
                                    ) : (
                                        <></>
                                    )}
                                    {isBataille ? (
                                        <>
                                            <div id='affichage_cartes_bataille'>
                                                {JSON.parse(localStorage.getItem("cartesEnBataille") || '') ? (
                                                    JSON.parse(localStorage.getItem("cartesEnBataille") || '').map((carte: any, carteIndex: any) => (
                                                        <div key={carteIndex} className="card">
                                                            <img className="images" src={`/cards/${carte.identifiant}_${carte.symbole}.gif`} alt={`Card ${carte.identifiant}`} />
                                                        </div>
                                                    ))

                                                ) : (<></>)}
                                            </div>


                                        </>
                                    ) : (
                                        <></>
                                    )}
                                    <div className="cartesPosees"></div>
                                    {/* JEU */}
                                    <div id='miseEnJeu'>
                                        {miseEnJeu ? (miseEnJeu.map((liste: any, index: any) => (
                                            <div key={index} className="listes">
                                                {liste.map((carteIndex: any) => (
                                                    <div key={carteIndex} className="card">
                                                        <img className="images" src={`/cards/cache.jpg`} />
                                                    </div>
                                                ))}
                                            </div>
                                        ))) : (<></>)}
                                    </div>



                                </div>
                                {/* MAIN */}
                                <div className="hand_container">
                                    {main.cards.map((card: any, indexCard: number) => (
                                        <div key={indexCard} className="cardInHand card" onClick={() => submitCard(card)}>
                                            <img className="images" src={`/cards/${card.identifiant}_${card.symbole}.gif`} alt={`Card ${card.identifiant}`} />
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                    </>

                </section >
                {/* CHAT */}
                < section id="chat" >
                    <div id="autres">
                        <div onClick={() => afficheRegles()}>
                            <QuestionMarkIcon className='regles'></QuestionMarkIcon>
                        </div>
                        <div className='nbjoueursdiv'>
                            <span>Nombre de joueurs : {nbJoueurs}</span>
                        </div>
                    </div>

                    <div id='messages'>
                        {messages.map((messageData, index) => (
                            <p key={index} className={messageData.username === JSON.parse(localStorage.getItem('user') || '{}').username ? 'own-message' : ''}>
                                <span><strong className="message-owner">{messageData.username}</strong> :</span> <span>{messageData.message}</span>
                            </p>
                        ))}
                    </div>
                    <form className='formChat' onSubmit={handleSubmit}>
                        <input
                            type='text'
                            minLength={1}
                            name='username'
                            id='username'
                            className='username__input'
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            ref={inputRef}
                        />
                        <button>Send</button>
                    </form>
                </section >
            </main >

        </>
    );


};

export default Partie;
