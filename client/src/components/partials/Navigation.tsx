import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { AppBar, Box, Toolbar, Typography, Button } from "@mui/material";

const Navigation = () => {
  const { token, user, logout } = useAuth();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography
            color="inherit"
            component={Link}
            to="/"
            variant="h6"
            sx={{ flexGrow: 1, textDecoration: "none" }}
          >
            Accueil
          </Typography>
          {!token || !user ? (
            <>
              <Button
                component={Link}
                to="/register"
                sx={{ m: 2 }}
                color="inherit"
              >
                Register
              </Button>
              <Button
                component={Link}
                to="/login"
                sx={{ m: 2 }}
                color="inherit"
              >
                Login
              </Button>
            </>
          ) : (
            <>
              <Button
                component={Link}
                to="/choose-game"
                sx={{ m: 2 }}
                color="inherit"
              >
                Create Game
              </Button>
              <Button
                component={Link}
                to="/all-games"
                sx={{ m: 2 }}
                color="inherit"
              >
                All Games
              </Button>
              <Button
                component={Link}
                to="/my-games"
                sx={{ m: 2 }}
                color="inherit"
              >
                My Games
              </Button>
              <Button
                component={Link}
                to="/my-ongoing-games"
                sx={{ m: 2 }}
                color="inherit"
              >
                Ongoing Games
              </Button>
              <Button
                component={Link}
                to="/scores"
                sx={{ m: 2 }}
                color="inherit"
              >
                Scores
              </Button>

              <Button
                sx={{ m: 2 }}
                color="inherit"
              >
                Bienvenue {JSON.parse(localStorage.getItem("user") || '{]').username}
              </Button>


              < Button
                onClick={() => {
                  logout();
                }}
                sx={{ m: 2 }}
                color="inherit"
              >
                Logout
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
    </Box >
  );
};

export default Navigation;
