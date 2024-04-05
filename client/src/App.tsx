
import "./App.css";
import Navigation from "./components/partials/Navigation";
import Footer from "./components/partials/Footer";
import Home from "./pages/Home";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  // Navigate,
} from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
// import useAuth from "./hooks/useAuth2";

import CreateGame from "./pages/Game/CreateGame/CreateGame";
import ChooseGame from "./pages/Game/ChooseGame/ChooseGame";
import AllGames from "./pages/Game/AllGames/AllGames";
import JoinGameBataille from "./pages/Game/JoinGameBataille/JoinGame";
import JoinGameBoeuf from "./pages/Game/JoinGameBoeuf/JoinGame";
import JoinGameCarre from "./pages/Game/JoinGameCarre/JoinGame";
import Scores from "./pages/Game/Scores/Scores";

// import PartieBataille from "./pages/Game/PartieBataille/Partie";
// import PartieCarre from "./pages/Game/PartieCarre/Partie";
// import PartieBoeuf from "./pages/Game/PartieBoeuf/Partie";
import StartGameBataille from "./pages/Game/StartGameBataille/StartGame";
import StartGameBoeuf from "./pages/Game/StartGameBoeuf/StartGame";
import SalleAttenteBataille from "./pages/Game/PartieBataille/SalleAttente";
import SalleAttenteCarre from "./pages/Game/PartieCarre/SalleAttente";
import SalleAttenteBoeuf from "./pages/Game/PartieBoeuf/SalleAttente";
import StartGameCarre from "./pages/Game/StartGameCarre/StartGame";
import { QueryClient, QueryClientProvider } from 'react-query';
import MyGames from "./pages/Game/MyGames/MyGames";
import MyOngoingGames from "./pages/Game/MyOngoingGames/MyOngoingGames";
import React, { Suspense } from "react";
const PartieBatailleLazy = React.lazy(() => import('./pages/Game/PartieBataille/Partie'));
const PartieCarreLazy = React.lazy(() => import('./pages/Game/PartieCarre/Partie'));
const PartieBoeufLazy = React.lazy(() => import('./pages/Game/PartieBoeuf/Partie'));



const queryClient = new QueryClient();
// function AuthenticatedRoute({ path, element }: { path: string; element: React.ReactNode }) {


//   if (!token || !user) return <Navigate to="/login" replace />;

//   return <Route path={path} element={element} />;
// }



const App = () => {
  // const { token, user } = useAuth();
  return (
    <Router>
      <AuthProvider>
        <Navigation />
        <div className="App">
          <Routes>
            <Route path="/register" element={<QueryClientProvider client={queryClient}><Register /></QueryClientProvider>} />
            <Route path="/login" element={<QueryClientProvider client={queryClient}><Login /></QueryClientProvider>} />
            <Route path="/scores" element={<QueryClientProvider client={queryClient}><Scores /></QueryClientProvider>} />

            <Route path="/create-game/:type" element={<QueryClientProvider client={queryClient}><CreateGame /></QueryClientProvider>} />
            <Route path="/choose-game" element={<QueryClientProvider client={queryClient}><ChooseGame /></QueryClientProvider>} />

            <Route path="/all-games" element={<QueryClientProvider client={queryClient}><AllGames /></QueryClientProvider>} />
            <Route path="/my-games" element={<QueryClientProvider client={queryClient}><MyGames /></QueryClientProvider>} />
            <Route path="/my-ongoing-games" element={<QueryClientProvider client={queryClient}><MyOngoingGames /></QueryClientProvider>} />

            <Route path="carre/join-game/:code" element={<QueryClientProvider client={queryClient}><JoinGameCarre /></QueryClientProvider>} />
            <Route path="bataille/join-game/:code" element={<QueryClientProvider client={queryClient}><JoinGameBataille /></QueryClientProvider>} />
            <Route path="boeuf/join-game/:code" element={<QueryClientProvider client={queryClient}><JoinGameBoeuf /></QueryClientProvider>} />

            <Route path="bataille/start/:code" element={<QueryClientProvider client={queryClient}><StartGameBataille /></QueryClientProvider>} />
            <Route path="carre/start/:code" element={<QueryClientProvider client={queryClient}><StartGameCarre /></QueryClientProvider>} />
            <Route path="boeuf/start/:code" element={<QueryClientProvider client={queryClient}><StartGameBoeuf /></QueryClientProvider>} />

            {/* <Route path="carre/partie/:code" element={<QueryClientProvider client={queryClient}><PartieCarre /></QueryClientProvider>} /> */}

            {/* <Route path="bataille/partie/:code" element={<QueryClientProvider client={queryClient}><PartieBataille /></QueryClientProvider>} /> */}
            <Route path="bataille/partie/:code" element={
              <Suspense fallback={<div>Loading...</div>}>
                <PartieBatailleLazy />
              </Suspense>
            } />

            <Route path="carre/partie/:code" element={
              <Suspense fallback={<div>Loading...</div>}>
                <PartieCarreLazy />
              </Suspense>
            } />

            <Route path="boeuf/partie/:code" element={
              <Suspense fallback={<div>Loading...</div>}>
                <PartieBoeufLazy />
              </Suspense>
            } />
            {/* <Route path="boeuf/partie/:code" element={<QueryClientProvider client={queryClient}><PartieBoeuf /></QueryClientProvider>} /> */}


            <Route path="bataille/salle/:code" element={<QueryClientProvider client={queryClient}><SalleAttenteBataille /></QueryClientProvider>} />
            <Route path="carre/salle/:code" element={<QueryClientProvider client={queryClient}><SalleAttenteCarre /></QueryClientProvider>} />
            <Route path="boeuf/salle/:code" element={<QueryClientProvider client={queryClient}><SalleAttenteBoeuf /></QueryClientProvider>} />

            <Route path="/" element={<QueryClientProvider client={queryClient}><Home /></QueryClientProvider>} />
          </Routes>
          <Footer />

        </div>

      </AuthProvider>
    </Router >
  );
};

export default App;
