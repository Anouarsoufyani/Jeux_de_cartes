import { Card, Grid, Box, Container } from "@mui/material";
// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import useAuth from "../hooks/useAuth";

const Home = () => {
  // const navigate = useNavigate();
  // const { token, user } = useAuth();

  // useEffect(() => {
  //   if (token && user) {
  //     navigate("/");
  //   }
  // });

  return (
    <Container maxWidth="lg">
      <Box sx={{ flexGrow: 1, mt: 15 }}>
        <Grid container spacing={2} columns={12}>
          <Grid item xs={12}>
            <Card sx={{ minWidth: 275, p: 10 }}>
              <Grid item xs={12}>
                <Box sx={{ textAlign: "center" }}>
                  <h4 className="mt-5">Welcome</h4>
                </Box>
              </Grid>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Home;
