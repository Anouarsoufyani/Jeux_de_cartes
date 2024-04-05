import { useMutation, useQuery } from "react-query"
import { GameService } from "../services/game.service"

export const useCreateGameMutation = (type: string) => {
    return useMutation({
        mutationFn: () => {
            return GameService.createGame(type)
        },
    })
}

export const useGetAllGames = () => {
    return useQuery({
        queryFn: () => { return GameService.getAllGames() },
        queryKey: 'get-all-games'
    })

}

export const useGetMyGames = () => {
    return useQuery({
        queryFn: () => { return GameService.getMyGames() },
        queryKey: 'get-my-games'
    })
}

export const useGetMyOngoingGames = () => {
    return useQuery({
        queryFn: () => { return GameService.getMyOngoingGames() },
        queryKey: 'get-my-ongoing-games'
    })
}

export const useGetMyCompletedGames = () => {
    return useQuery({
        queryFn: () => { return GameService.getMyCompletedGames() },
        queryKey: 'get-my-ongoing-games'
    })
}

// export const useGetGame = () => {
//     return useQuery({
//         queryFn: () => { return GameService.getGame() },
//         queryKey: 'get-game'
//     })

// }

export const useGetGame = ({ code }: { code: string }) => {
    const query = useQuery(['getGame', code], () => GameService.getGame(code));

    return query;
};

export const useJoinGameMutation = (code: string) => {
    return useMutation({
        mutationFn: () => {
            return GameService.joinGame(code)
        },
    })
}

export const useStartGameBatailleMutation = () => {
    return useMutation({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mutationFn: (game: any) => {
            return GameService.startGameBataille(game)
        },
    })
}

export const useStartGameCarreMutation = () => {
    return useMutation({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mutationFn: (game: any) => {
            return GameService.startGameCarre(game)
        },
    })
}

export const useStartGameBoeufMutation = () => {
    return useMutation({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mutationFn: (game: any) => {
            return GameService.startGameBoeuf(game)
        },
    })
}