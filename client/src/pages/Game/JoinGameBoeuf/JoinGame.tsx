/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams } from "react-router-dom";
import { useJoinGameMutation } from "../../../hooks/game.hooks";
import { useNavigate } from "react-router-dom";

const JoinGame = () => {
    const { code } = useParams<string>();

    const navigate = useNavigate();

    //SI USER CONNECTE ET PAS PROPRIETAIRE DE LA PARTIE => RETURN JOIN BUTTON
    //SI USER CONNECTE ET PROPRIETAIRE DE LA PARTIE => RETURN JOIN BUTTON

    const joinGameMutation = useJoinGameMutation(code as string)


    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Form data before submission:", e); // Ajoutez cette ligne pour déboguer

        // Utilisez directement le code de la partie extrait de l'URL
        await joinGameMutation.mutateAsync();
        navigate(`/boeuf/salle/${code}`);

    };


    return (
        <div>
            <h1>Joining : {code} </h1>
            <form onSubmit={onSubmit}>
                <button type="submit" className="btn btn-primary" disabled={joinGameMutation.isLoading}>
                    Join game
                </button>
            </form>
        </div>
    )

}

export default JoinGame