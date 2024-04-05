import { GameStatus } from "../../../entities/GameStatus";
import userDto from "./userDto";

interface gameResponseDto {
    type: string,
    code: string,
    owner: userDto,
    players: userDto[],
    status: GameStatus
}

export default gameResponseDto;
