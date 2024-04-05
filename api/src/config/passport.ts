import { Strategy, ExtractJwt } from "passport-jwt";
import { DI } from "../app";

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: "secret",
};

export const applyPassportConfig = (passport: {
  use: (arg0: Strategy) => void;
}) => {
  passport.use(
    new Strategy(options, async (jwt_payload, done) => {
      const user = await DI.userRepository.findOne({
        username: jwt_payload.username,
      });
      if (!user) return done(null, false);

      return done(null, user);
    })
  );
};
