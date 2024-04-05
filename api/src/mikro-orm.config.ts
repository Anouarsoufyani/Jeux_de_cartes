import { __prod__ } from "./constants";
import { User, Game, Hand } from "./entities";
import { MikroORM } from "@mikro-orm/core";
import { MongoHighlighter } from "@mikro-orm/mongo-highlighter";
import path from "path";

export default {
  migrations: {
    path: path.join(__dirname, "./migrations"),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  type: "mongo",
  entities: [User, Game, Hand],
  dbName: "projet-fac",
  clientUrl:
    "mongodb+srv://anouar:4XOk04srO1J5ycVd@cluster0.vsbv1pa.mongodb.net/?retryWrites=true&w=majority",
  highlighter: new MongoHighlighter(),
  debug: !__prod__,
} as Parameters<typeof MikroORM.init>[0];
