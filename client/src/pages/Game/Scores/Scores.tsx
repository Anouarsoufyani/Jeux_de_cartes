/* eslint-disable @typescript-eslint/no-explicit-any */
import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import { useGetMyCompletedGames } from "../../../hooks/game.hooks"
// import { Link } from "react-router-dom";
import { useGetAllUsersQuery } from "../../../hooks/auth.hooks";
// import { io } from "socket.io-client";


const MyGames = () => {

    const getMyGames = useGetMyCompletedGames()
    const getAllUsersQuery = useGetAllUsersQuery();
    const allUsers = getAllUsersQuery.data?.data.users;
    console.log(allUsers);

    const games = getMyGames.data?.data.games;

    console.log("started games", games ? games.filter((game: any) => game.status === "started") : []);


    return (
        <>
            {getMyGames.isLoading ? (
                <div>Loading</div>
            ) : (
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell align="left">Username</TableCell>
                                <TableCell align="left">Victoires bataille</TableCell>
                                <TableCell align="left">Victoires 6 qui prend</TableCell>
                                <TableCell align="left">Victoires carré</TableCell>
                                <TableCell align="left">Défaites bataille</TableCell>
                                <TableCell align="left">Défaites 6 qui prend</TableCell>
                                <TableCell align="left">Défaites carré</TableCell>
                                <TableCell align="left">Victoires Totales</TableCell>
                                <TableCell align="left">Défaites Totales</TableCell>
                            </TableRow>
                        </TableHead>
                        {/* <div>
                            {
                                allUsers.map((user: any) => (
                                    <div>
                                        {user.username == "caca" || user.username == "Anouar" || user.username == "ekiriano" || user.username == "noir" || user.username == "mouss48" || user.username == "ninou" || user.username == "nom" || user.username == "noir" || user.username == "Abou" || user.username == "Rayan" ? (
                                            <></>
                                        ) : (
                                            <p>{user.username}</p>
                                        )}
                                    </div>

                                ))
                            }
                        </div> */}
                        <TableBody>
                            {allUsers.map((user: any) => (

                                <TableRow>
                                    {user.username == "caca" || user.username == "Anouar" || user.username == "ekiriano" || user.username == "noir" || user.username == "mouss48" || user.username == "ninou" || user.username == "nom" || user.username == "noir" || user.username == "Abou" || user.username == "Rayan" ? (
                                        <></>
                                    ) : (
                                        <>
                                            <TableCell align="left">{user.username}</TableCell>
                                            <TableCell align="left">{user.batailleW}</TableCell>
                                            <TableCell align="left">{user.boeufW}</TableCell>
                                            <TableCell align="left">{user.carreW}</TableCell>
                                            <TableCell align="left">{user.batailleL}</TableCell>
                                            <TableCell align="left">{user.boeufL}</TableCell>
                                            <TableCell align="left">{user.carreL}</TableCell>
                                            <TableCell align="left">{user.batailleW + user.boeufW + user.carreW}</TableCell>
                                            <TableCell align="left">{user.batailleL + user.boeufL + user.carreL}</TableCell>
                                        </>
                                    )}

                                    {/* <TableCell align="left">{user.allW}</TableCell>
                                    <TableCell align="left">{user.carreL}</TableCell> */}

                                </TableRow>
                            ))}

                        </TableBody>
                    </Table>
                </TableContainer>

            )}


        </>
    )
}

export default MyGames