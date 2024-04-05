/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router";
import { setAuthToken } from "../utils";
import { AuthService, loginRequestDto, registerRequestDto } from "../services";
import { AxiosError } from "axios";

interface AuthContextType {
  token?: string;
  user?: any;
  loading: boolean;
  error?: any;
  login: (params: loginRequestDto) => void;
  register: (params: registerRequestDto) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({
  children,
}: {
  children: ReactNode;
}): JSX.Element => {
  const [user, setUser] = useState<any>();
  const [token, setToken] = useState<string>();
  const [error, setError] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);

  const navigate = useNavigate();

  useEffect(() => {
    setUser(localStorage.getItem("user"));
    setToken(localStorage.getItem("access_token") || undefined);

    setLoadingInitial(false);
  }, []);

  const login = async (params: loginRequestDto) => {
    setLoading(true);
    try {
      const { data } = await AuthService.login(params);

      const token = data.token ?? "";
      localStorage.setItem("access_token", token);
      setAuthToken(token);

      localStorage.setItem(
        "user",
        JSON.stringify({ id: data.id, username: data.username })
      );

      setToken(data.token);
      setUser({ id: data.id, username: data.username });
    } catch (err) {
      // @ts-ignore
      if (err?.isAxiosError && err?.response) {
        const error = err as AxiosError;
        if (error && error.response) {
          // @ts-ignore
          setError(error.response.data.errors);
        }
      }
    }

    setLoading(false);
    navigate("/");
  };

  const register = async (params: registerRequestDto) => {
    setLoading(true);

    const { data } = await AuthService.register(params);

    if (data.success) {
      navigate("/login");
    }

    setError({ error: data.errors });

    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setToken(undefined);
    setUser(undefined);
    navigate("/");
  };

  const memoedValue = useMemo(
    () => ({
      token,
      loading,
      error,
      login,
      register,
      logout,
      user,
    }),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [token, loading, error, user]
  );

  return (
    <AuthContext.Provider value={memoedValue}>
      {!loadingInitial && children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export default function useAuth() {
  return useContext(AuthContext);
}
