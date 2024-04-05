/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    createContext,
    useContext,
} from "react";
import { loginRequestDto, registerRequestDto } from "../services/auth.service";

interface AuthContextType {
    token?: string;
    user?: any;
    loading: boolean;
    error?: any;
    login: (params: loginRequestDto) => void;
    register: (params: registerRequestDto) => void;
    logout: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export default function useAuth() {
    return useContext(AuthContext);
}
