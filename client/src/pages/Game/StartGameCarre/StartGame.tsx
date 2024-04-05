/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams } from "react-router-dom";
import { useStartGameCarreMutation } from "../../../hooks/game.hooks";
import { useNavigate } from "react-router-dom";



const StartGame = () => {

    const navigate = useNavigate();


    //SI USER CONNECTE ET PAS PROPRIETAIRE DE LA PARTIE => RETURN JOIN BUTTON
    //SI USER CONNECTE ET PROPRIETAIRE DE LA PARTIE => RETURN JOIN BUTTON

    const startGameMutation = useStartGameCarreMutation()

    const { code } = useParams<any>();

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Form data before submission:", e); // Ajoutez cette ligne pour déboguer

        // Utilisez directement le code de la partie extrait de l'URL
        await startGameMutation.mutateAsync({ gameCode: code });
        navigate(`/carre/salle/${code}`);

    };


    return (
        <div>
            <h1>Starting : {code} </h1>
            <form onSubmit={onSubmit}>
                <button type="submit" className="btn btn-primary" disabled={startGameMutation.isLoading}>
                    Start game
                </button>
            </form>
        </div>
    )

}

export default StartGame