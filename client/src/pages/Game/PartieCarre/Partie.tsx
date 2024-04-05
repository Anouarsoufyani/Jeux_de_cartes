/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './PartieCarre.css';






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
    const [compteur, setCompteur] = useState<number>(0);
    const [winner, setWinner] = useState<any>();
    const [choixLigne, setChoixLigne] = useState<any>(false);

    const [clique, setClique] = useState(false);
    const [clicMJ, setClicMJ] = useState(false);
    const [test, setTest] = useState(false);
    const [joueursCliques, setJoueursCliques] = useState(0);

    // compteur de changement de pioche 








    const inputRef = useRef<HTMLInputElement | null>(null);


    


    const handleClick = () => {
        if (!clique) {
            setClique(true);
            // Émettre un événement pour signaler le changement de mise en jeu

            socket.emit("joueurClic", miseEnJeu)
            setJoueursCliques(joueursCliques + 1);
            setClique(false)
        }
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('Message', message);
        socket.emit('send_message', { username: user.username, message });
        setMessage('');  // Met à jour l'état pour vider l'input
    };

    socket.on("nbJoueurs", data => {
        setNbJoueurs(data);

    });


    useEffect(() => {
        socket.on("miseEnJeu", data => {
            setMiseEnJeu(data);
            setChoisi(false);
        });

        return () => {
            socket.off('miseEnJeu');
        };
    }, [])


    useEffect(() => {
        socket.on("clicfalse", () => {
            setClique(true)

        });
    }, [])

    useEffect(() => {
        socket.on("clictrue", () => {
            setClique(false)
            

        });
    }, [])


    useEffect(() => {
        socket.on('receive_message', (data) => {
            setMessages((prevMessages) => [...prevMessages, data]);

        });

        return () => {
            socket.off('receive_message');
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

                } else {
                    setCompteur(0);
                }
            });

            if (compteur != 0) {
                // setFini(true);
                socket.emit("generateNewPack", userId)

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
        socket.on("partieFinie", (data: any) => {
            setFini(true);
            setWinner(data);
            console.log("data",data);
            
            socket.emit("gameFin")

        });

        return () => {
            socket.off('partieFinie');
        };
    }, [])


    useEffect(() => {
        if (main && generated) {
            const userId = JSON.parse(localStorage.getItem('user') || '{}').id;


            setChoisi(true);
            socket.emit("updateHand", { hand: main, userId: userId });
        }
        else if (main && main.cards.length > 0) {
            const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
            socket.emit("updateHand", { hand: main, userId: userId });
        }


    }, [main]);




    useEffect(() => {
        socket.on("doitChoisir", (data) => {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            


            if (data == user.id) {
                setChoixLigne(true);
                localStorage.setItem('choixligne', "true")
            }

        });

        return () => {
            socket.off("doitChoisir");
        };
    });

    useEffect(() => {
        socket.on("enablePlay", (data: any) => {
            const userid = JSON.parse(localStorage.getItem('user') || '{}').id;
            if (data == userid) {
                setTest(false);
            }

        });

        return () => {
            socket.off("enablePlay");
        };
    });



    const submitCard = (card: any, indexMain: number) => {
        const userId = JSON.parse(localStorage.getItem('user') || '{}').id;

        if (!choisi) {
            setGenerated(true);
            setClicMJ(true)


            socket.emit('sendCard', { card: card, userid: userId, indexMain: indexMain });



            setMain((prevMain: any) => {
                // Filtrer la carte du tableau des cartes
                const updatedCards = prevMain.cards.filter((c: any) => c !== card);

                // Retourner un nouvel objet "main" avec les cartes mises à jour
                return { ...prevMain, cards: updatedCards };
            });
        } else {
            setGenerated(false);

        }
    };


    const submitMJ = (indexMJ: any) => {
        const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
        if (test == false && clicMJ == true) {
            socket.emit("indice", { indexMJ:indexMJ,userid:userId}) //envoie de la l index de la carte dans MJ qui doit etre echange 
            setTest(true)
            setChoisi(false)
            setClicMJ(false)
            localStorage.setItem('choixligne', "false")
        }
    };


    // envoie au back un socket afin de savoir qd l utilisateur veut changer de pioche + pas le droit de changer de pioche plus de 3x





    return (
        <>
            <main id='game'>
                <section id="game_container">
                    {fini ? (
                        <>
                            <span>La partie est finie</span>
                            <p>Le gagnant est : {JSON.stringify(winner.username)}</p>
                        </>
                    ) : (
                        <>
                            <div className="game">

                                {/* <span>Votre score : {score}</span> */}

                                {/*Changement MJ */}

                                {/* {test ? (
                                    <><div><span>Veuillez attendre que les autres joueurs finissent leur tour</span></div></>
                                ) : (
                                    <><span>Vous pouvez jouer</span></>
                                )} */}


                                {/* {JSON.parse(localStorage.getItem("choixligne") as string) as boolean ? (
                                    <><div><span>Veuillez choisir une ligne</span></div></>
                                ) : (
                                    <><span></span></>
                                )} */}



                                <div className="cartesPosees"></div>
                                {/* JEU */}
                                <div id='miseEnJeu'>
                                    {miseEnJeu ? (miseEnJeu.map((carte: any, indexMJ: any) => (
                                        <div key={indexMJ} className="listes">
                                            {
                                                <div key={indexMJ} className="card" onClick={() => submitMJ(indexMJ)} >
                                                    <img className="images" src={`/cards/${carte.identifiant}_${carte.symbole}.gif`} alt={`Card ${carte.identifiant}`} />
                                                </div>
                                            }
                                        </div>
                                    ))) : (<span>pas de miseEnJeu</span>)}

                                </div>



                            </div>
                            {/* MAIN */}
                            <div className="hand_container">
                                <div className="cardsInHand">
                                    {main.cards.map((card: any, indexMain: number) => (
                                        <div key={indexMain} className="card cardInHand" onClick={() => submitCard(card, indexMain)}>
                                            <img className="images" src={`/cards/${card.identifiant}_${card.symbole}.gif`} alt={`Card ${card.identifiant}`} />
                                        </div>
                                    ))}
                                </div>

                                <div>
                                    <button onClick={handleClick} disabled={clique}>
                                        Changer de mise en jeu
                                    </button>
                                </div>
                            </div>
                        </>
                    )}


                </section>



                {/* CHAT */}
                <section id="chat">
                    <span>Nombre de joueurs : {nbJoueurs}</span>

                    <div id='messages'>
                        {messages.map((messageData, index) => (
                            <p key={index} className={messageData.username === JSON.parse(localStorage.getItem('user') || '{}').username ? 'own-message' : ''}>
                                <span><strong className="message-owner">{messageData.username}</strong> :</span> <span>{messageData.message}</span>
                            </p>
                        ))}
                    </div>
                    <form onSubmit={handleSubmit}>
                        <hr />
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
                </section>
            </main>
        </>
    );


};

export default Partie;
