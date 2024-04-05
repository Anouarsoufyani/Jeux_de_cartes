/* eslint-disable @typescript-eslint/no-explicit-any */
import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import { useGetAllGames } from "../../../hooks/game.hooks";
import { Link } from "react-router-dom";
import { useGetAllUsersQuery } from "../../../hooks/auth.hooks";

const AllGames = () => {
    const getAllGamesQuery = useGetAllGames();
    const allGames = getAllGamesQuery.data?.data?.games;  // Ajoutez une vérification ici
    const getAllUsersQuery = useGetAllUsersQuery();
    const allUsers = getAllUsersQuery.data?.data.users;  // Ajoutez une vérification ici

    const user = JSON.parse(localStorage.getItem('user') || '{}');


    console.log(user.id);

    // Filtrer les jeux avec le statut "unstarted"
    const unstartedGames = allGames ? allGames.filter((game: any) => game.status === "unstarted" && game.owner != user.id) : [];

    return (
        <>
            {getAllGamesQuery.isLoading ? (
                <div>Loading</div>
            ) : (
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell align="left">Game Number</TableCell>
                                <TableCell align="left">type</TableCell>
                                <TableCell align="left">Owner</TableCell>
                                <TableCell align="left">NbPlayers</TableCell>
                                <TableCell align="left">Status</TableCell>
                                <TableCell align="left">Join</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {unstartedGames.map((game: any) => (
                                <TableRow key={game.code}>
                                    <TableCell align="left">{game.code}</TableCell>
                                    {game.type == "boeuf" ? (
                                        <TableCell align="left">6 qui prend</TableCell>

                                    ) : (
                                        <TableCell align="left">{game.type}</TableCell>

                                    )}
                                    <TableCell align="left">{allUsers.find((user: any) => user.id === game.owner)?.username}</TableCell>
                                    <TableCell align="left">{game.players.length}/10</TableCell>
                                    <TableCell align="left">{game.status}</TableCell>
                                    <TableCell align="left">
                                        <Link to={`/${game.type}/join-game/${game.code}`}>Join the game</Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </>
    );
};

export default AllGames;

