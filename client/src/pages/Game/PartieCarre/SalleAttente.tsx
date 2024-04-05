/* eslint-disable @typescript-eslint/no-explicit-any */
import { useGetMyOngoingGames } from "../../../hooks/game.hooks"
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
// import { io } from "socket.io-client";


const SalleAttente = () => {
    const { code } = useParams<any>();
    const [lance, setLance] = useState<boolean>(false);

    const getMyOngoingGames = useGetMyOngoingGames()
    const games = getMyOngoingGames.data?.data.games;

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const game = games ? games.filter((game: any) => game.code == code) : [];

    useEffect(() => {
        if (game && game.length > 0 && game[0].status === "started") {
            setLance(true);
        }
    }, [game]);

    return (
        <>
            {lance ? (
                // Bouton cliquable pour entrer dans la partie
                <a href={`/carre/partie/${code}`}>Entrer dans la partie</a>
            ) : (
                // Bouton grisé non cliquable
                <button disabled>En attente du début de la partie...</button>
            )}
        </>
    )
}

export default SalleAttente