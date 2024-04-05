import { useQuery } from "react-query"
import { AuthService } from "../services/auth.service"


export const useGetAllUsersQuery = () => {
    return useQuery({
        queryFn: () => { return AuthService.getAllUsers() },
        queryKey: 'get-all-users'
    })

}