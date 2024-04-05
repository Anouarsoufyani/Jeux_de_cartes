

import { useParams } from "react-router-dom";
import { useCreateGameMutation } from "../../../hooks/game.hooks";



const CreateGame = () => {
  const { type } = useParams<string>();

  const createGameMutation = useCreateGameMutation(type as string)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (e: any) => {
    e.preventDefault();
    await createGameMutation.mutateAsync();
  }


  return (
    <div>
      <h1>Create {type} Game</h1>
      <form onSubmit={onSubmit} >
        <button type="submit" className="btn btn-primary" disabled={createGameMutation.isLoading}>
          Create game
        </button>

        <p style={{ color: "white" }}>Your link to join the game is:  http://localhost:5173/join-game/{createGameMutation.data?.data.code}</p>

      </form>
    </div>

  )
};

export default CreateGame;
