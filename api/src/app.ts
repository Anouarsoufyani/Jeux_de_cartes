import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { Game, User, Hand } from "./entities";
import {
  EntityManager,
  EntityRepository,
  MikroORM,
  RequestContext,
} from "@mikro-orm/core";
import passport from "passport";
import { applyPassportConfig } from "./config/passport";
import authRoutes from "./routes/auth";
import gameRoutes from "./routes/game";


export const DI = {} as {
  orm: MikroORM;
  em: EntityManager;
  userRepository: EntityRepository<User>;
  gameRepository: EntityRepository<Game>;
  handRepository: EntityRepository<Hand>;
};

export const app = express();
export const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  },
});

(async () => {
  DI.orm = await MikroORM.init();
  DI.em = DI.orm.em;
  DI.userRepository = DI.orm.em.getRepository(User);
  DI.gameRepository = DI.orm.em.getRepository(Game);
  DI.handRepository = DI.orm.em.getRepository(Hand);

  dotenv.config({ path: "./config/local.env" });

  app.use(passport.initialize());
  app.use(cors());
  app.use(express.json());

  // Passport Config
  applyPassportConfig(passport);

  if (process.env.ENVIRONMENT === "dev") {
    app.use(morgan("dev"));
  }

  app.use((_req, _res, next) => RequestContext.create(DI.orm.em, next));

  app.use("/auth", authRoutes);
  app.use("/game", gameRoutes);
  app.use((_req, res) => res.status(404).json({ error: "No route found" }));

  io.on("connection", (socket) => {

    // Exemple d'émission d'un événement depuis le serveur vers le client

    // Exemple de réception d'un événement depuis le client
    socket.on("send_message", (data) => {

      // console.log(`Message : ${JSON.stringify(data)}`)
      io.emit("receive_message", data);
    });

    socket.on("disconnect", () => {
    });
  });



  // Utilisez le même serveur HTTP pour écouter les connexions WebSocket et Express
  server.listen(8080, () => {
    console.log(`Serveur en cours d'exécution sur le port 5000`);
  });
})();