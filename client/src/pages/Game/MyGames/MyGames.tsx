/* eslint-disable @typescript-eslint/no-explicit-any */
import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import { useGetMyGames } from "../../../hooks/game.hooks"
import { Link } from "react-router-dom";
// import { io } from "socket.io-client";


const MyGames = () => {

    const getMyGames = useGetMyGames()

    const games = getMyGames.data?.data.games;



    return (
        <>
            {getMyGames.isLoading ? (
                <div>Loading</div>
            ) : (
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell align="left">Game Number</TableCell>
                                <TableCell align="left">type</TableCell>
                                <TableCell align="left">NbPlayers</TableCell>
                                <TableCell align="left">Status</TableCell>
                                <TableCell align="left">Start</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {games.map((game: any) => (
                                <TableRow>
                                    <TableCell align="left">{game.code}</TableCell>
                                    <TableCell align="left">{game.type}</TableCell>
                                    <TableCell align="left">{game.players.length}/10</TableCell>
                                    <TableCell align="left">
                                        {game.status === "completed" ? "complet" : game.status}
                                    </TableCell>
                                    {game.players.length > 1 ? (
                                        <TableCell align="left">
                                            {game.status === "unstarted" ? (
                                                <Link to={`/${game.type}/start/${game.code}`}>Start the game</Link>
                                            ) : (
                                                game.status === "completed" ? (
                                                    "Partie terminée" // Display "Partie terminée" for completed games besides "complet"
                                                ) : (
                                                    <span>En cours</span> // Display "En cours" for ongoing games (assuming no other statuses)
                                                )
                                            )}
                                        </TableCell>
                                    ) : (
                                        <TableCell align="left">Il n'y a pas assez de joueurs dans la partie</TableCell>
                                    )}
                                </TableRow>
                            ))}

                        </TableBody>
                    </Table>
                </TableContainer >
            )}


        </>
    )
}

export default MyGames