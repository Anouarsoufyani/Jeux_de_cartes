/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

const http = axios.create({
  baseURL: " http://localhost:8080",
});

http.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem("access_token");
    if (token !== null) config.headers.Authorization = ` ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

function isTokenExpiredError(errorResponse: any) {
  return errorResponse && errorResponse.status === 401;
}

http.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const errorResponse = error.response;
    if (error.message === "Network Error") {
      return Promise.reject({
        ...error,
        ...{
          response: {
            data: {
              error_description: error.message,
            },
          },
        },
      });
    }
    if (
      isTokenExpiredError(errorResponse) &&
      window.location.pathname !== "/auth/login"
    ) {
      // check not login page
      localStorage.clear();
      window.location.pathname = `/login`;
    }
    // If the error is due to other reasons, we just throw it back to axios
    return Promise.reject(error);
  }
);

const setAuthToken = (token: string) => {
  if (token) {
    http.defaults.headers.common["Authorization"] = token;
  } else {
    delete http.defaults.headers.common["Authorization"];
  }
};

export { http, setAuthToken };
