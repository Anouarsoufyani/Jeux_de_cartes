import express from "express";
import passport from "passport";
import { GameController } from "../controllers/game/gameController";

const router = express.Router();

router.post(
  "/:type",
  passport.authenticate("jwt", { session: false }),
  GameController.createGame
);

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  GameController.getAllGames
);

router.get(
  "/my-games",
  passport.authenticate("jwt", { session: false }),
  GameController.getMyGames
);

router.get(
  "/my-ongoing-games",
  passport.authenticate("jwt", { session: false }),
  GameController.getMyOngoingGames
);

router.get(
  "/my-completed-games",
  passport.authenticate("jwt", { session: false }),
  GameController.getMyCompletedGames
);

router.get(
  "/get-game/:code",
  passport.authenticate("jwt", { session: false }),
  GameController.getGame
);

router.post(
  "/join/:code",
  passport.authenticate("jwt", { session: false }),
  GameController.joinGame
);

router.post(
  "/bataille/start",
  passport.authenticate("jwt", { session: false }),
  GameController.startGameBataille
);

router.post(
  "/carre/start",
  passport.authenticate("jwt", { session: false }),
  GameController.startGameCarre
);


router.post(
  "/boeuf/start",
  passport.authenticate("jwt", { session: false }),
  GameController.startGameBoeuf
);

export default router;
