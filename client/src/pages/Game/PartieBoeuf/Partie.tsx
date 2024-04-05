/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './PartieBoeuf.css';



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
    const [choixLigne, setChoixLigne] = useState<any>(false);
    // const [compteur, setCompteur] = useState<boolean>(false);
    const [score, setScore] = useState<any>();
    const [winner, setWinner] = useState<any>();

    

    const inputRef = useRef<HTMLInputElement | null>(null);

    // const { code } = useParams<{ code?: string }>();

    const [tempsRestant, setTempsRestant] = useState(5);
    const [carteChoisie, setCarteChoisie] = useState<any>(null);

    useEffect(() => {
        

        const interval = setInterval(() => {
          setTempsRestant((tempsRestant) => tempsRestant - 1);
          if (tempsRestant === 0) {
            // Choisir une carte aléatoire
            const indiceAleatoire = Math.floor(Math.random() * main.cards.length);
            setCarteChoisie(main.cards[indiceAleatoire]);
      
            // Exécuter automatiquement la fonction handleChoixCarte
            
                const indiceAleatoireLigne = Math.floor(Math.random() * 4);
                
            setTimeout(() => submitLigne(indiceAleatoireLigne), 1);
            setTimeout(() => submitCard(main.cards[indiceAleatoire]), 10);
            
        
          }
        }, 1000);
        return () => clearInterval(interval);
      }, [tempsRestant, main.cards]);




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
                    localStorage.setItem("compteur", JSON.stringify(true))

                } else {
                    localStorage.setItem("compteur", JSON.stringify(false))
                    }
            });

            if (JSON.parse(localStorage.getItem("compteur") || '')) {
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
        const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
        
        socket.on("mainMAJ", (data :  any) => {
            
            
            if (data.userid == userId) {
                
                
                setMain({cards:data.hand.cards})
                
            }
        })
    })



    useEffect(() => {
        socket.on("CestFini", (data:any) => {
            setFini(true);
            setWinner(data);
            console.log("data",data);
            

        })
    })

   
    useEffect(() => {
        const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
        socket.on("updateScore", (data: any) => {

            for (const player of data.players) {
                if (player.id == userId) {
                    console.log(`SCORE DE ${player.username}`, player.score);
                    setScore(player.score)
                }
            }
        })
    }, []);








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


    }, [main]);

    const submitCard = (card: any) => {
        const userid = JSON.parse(localStorage.getItem('user') || '{}').id;

        if (!choisi && !choixLigne) {
            setGenerated(true);
           
            // Action à effectuer lorsqu'une carte est choisie par l'utilisateur
            setCarteChoisie(card);
            // Réinitialiser le temps
            setTempsRestant(5);

            socket.emit("sendCard", { card: card, userid: userid , hand : main});



            setMain((prevMain: any) => {
                // Filtrer la carte du tableau des cartes
                const updatedCards = prevMain.cards.filter((c: any) => c !== card);

                // Retourner un nouvel objet "main" avec les cartes mises à jour
                return { ...prevMain, cards: updatedCards };
            });
            socket.emit("updateHand", { hand: main, userId: userid });
        }
    };

    useEffect(() => {
        socket.on("doitChoisir", data => {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (data.id == user.id) {
                setChoixLigne(true);
            } else {
                setChoisi(true)
            }

        });

        return () => {
            socket.off("doitChoisir");
        };
    }, []);


    const submitLigne = (index: any) => {
        const userid = JSON.parse(localStorage.getItem('user') || '{}').id;


        if (choixLigne) {
            socket.emit("choixLigne", { index: index, userid: userid });
            setChoixLigne(false);
            // Réinitialiser le temps
            setTempsRestant(5);
        }
    };

    useEffect(() => {
        socket.on("partieFinie", (data: any) => {
            setFini(true);
            setWinner(data)
            console.log("T'es a ton prime", data.username);

        });

        return () => {
            socket.off('partieFinie');
        };
    }, [])

    // const reloadPage = () => {
    //     localStorage.setItem("compteur", JSON.stringify(true))

    //     window.location.reload();
    // }

    
    


    return (
        <>
            <section id="game_container">
                {fini ? (
                    <>
                        <span>La partie est finie</span>
                        <p>Le gagnant est : {JSON.stringify(winner.username)} , son score est de: {JSON.stringify(winner.score)} </p>
                    </>
                ) : (
                    <>
                        <div className="game">
                           
                        <h1>Choisissez une carte !</h1>
                        <p>Temps restant : {tempsRestant} secondes</p>

                            <div id='scoreStatDiv'>
                                            {
                                                score ? (
                                                    <>
                                                        <p>Score de {JSON.parse(localStorage.getItem('user') || '{}').username} : {score}</p>
                                                    </>

                                                ) : (
                                                    <>
                                                        <p>Score de {JSON.parse(localStorage.getItem('user') || '{}').username} : 0</p>
                                                    </>
                                                )
                                            }
                                </div>

                                {carteChoisie && <p>Carte choisie : {carteChoisie.numero}</p>}

                            {choixLigne ? (
                                <><div><span>Veuillez choisir une ligne</span></div></>
                            ) : (
                                <><span></span></>
                            )}

                            {/* {JSON.parse(localStorage.getItem("compteur") || '') ? (
                                <>
                                    <button onClick={reloadPage}>
                                        Redistribuer des cartes
                                    </button>
                                </>

                            ) : (
                                <></>
                            )} */}
                            <div className="cartesPosees"></div>
                            {/* JEU */}
                            <div id='miseEnJeu'>
                                {miseEnJeu ? (miseEnJeu.map((liste: any, index: any) => (
                                    <div key={index} className="listes" onClick={() => submitLigne(index)}>
                                        {liste.map((carte: any, carteIndex: any) => (
                                            <div key={carteIndex} className="card">
                                                <img className="images" src={`/cardsBoeuf/${carte.numero}.svg`} alt={`Card ${carte.numero}`} />
                                            </div>
                                        ))}
                                    </div>
                                ))) : (<span>pas de miseEnJeu</span>)}
                            </div>



                        </div>
                        {/* MAIN */}
                        <div className="hand_container">
                            {main.cards.map((card: any, index: number) => (
                                <div key={index} className="card cardInHand" onClick={() => submitCard(card)}>
                                    <img className="images" src={`/cardsBoeuf/${card.numero}.svg`} alt={`Card ${card.numero}`} />
                                </div>
                            ))}
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
        </>
    );


};

export default Partie;
