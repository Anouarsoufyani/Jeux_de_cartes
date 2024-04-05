/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosResponse } from "axios";
import { http } from "../utils";

interface userDto {
    id: string,
    email: string
}

// interface joinGameRequestDto {
//     gameCode: string;
// }

// interface joinGameResponseDto {
//     game: any;
// }

enum GameStatus {
    UNSTARTED = 'unstarted',
    STARTED = 'started',
    PAUSED = 'paused',
    COMPLETED = 'completed',
}

interface gameResponseDto {
    type: string,
    code: string,
    owner: userDto,
    players: userDto[],
    status: GameStatus
}



export const GameService = {
    getAllGames: async (): Promise<AxiosResponse<any>> => {
        return http.get(`/game`);
    },

    getMyGames: async (): Promise<AxiosResponse<any>> => {
        return http.get(`/game/my-games`);
    },

    getMyOngoingGames: async (): Promise<AxiosResponse<any>> => {
        return http.get(`/game/my-ongoing-games`);
    },

    getMyCompletedGames: async (): Promise<AxiosResponse<any>> => {
        return http.get(`/game/my-completed-games`);
    },

    getGame: async (code: string): Promise<AxiosResponse<any>> => {
        return http.get(`/game/get-game/${code}`);
    },

    createGame: async (type: string): Promise<AxiosResponse<gameResponseDto>> => {
        return http.post(`/game/${type}`);
    },

    joinGame: async (code: any): Promise<AxiosResponse<any>> => {
        return http.post(`/game/join/${code}`);
    },

    startGameBataille: async (
        data: any
    ): Promise<AxiosResponse<any>> => {
        return http.post("/game/bataille/start", data);
    },

    startGameCarre: async (
        data: any
    ): Promise<AxiosResponse<any>> => {
        return http.post("/game/carre/start", data);
    },

    startGameBoeuf: async (
        data: any
    ): Promise<AxiosResponse<any>> => {
        return http.post("/game/boeuf/start", data);
    },
};