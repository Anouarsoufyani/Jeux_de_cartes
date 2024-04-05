import { Request, Response } from "express";
import { DI } from "../../app";
import { User } from "../../entities";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import registerRequestDto from "./dtos/registerRequestDto";
import registerResponseDto from "./dtos/registerResponseDto";
import loginRequestDto from "./dtos/loginRequestDto";
import currentUserResponseDto from "./dtos/currentUserResponseDto";
import loginResponseDto from "./dtos/loginResponseDto";

export class AuthController {
  static getAllUsers = async (_req: Request, res: Response) => {
    const users = await DI.userRepository.findAll();
    // await DI.userRepository.removeAndFlush(users)

    res.json({ users });
  };

  static registerUser = async (
    req: Request<registerRequestDto>,
    res: Response<registerResponseDto>
  ) => {
    const { email, username, password } = req.body;
    const errors: { email?: string; username?: string; password?: string } = {};

    errors.email = email ? undefined : "email invalid";
    errors.username = username ? undefined : "username invalid";
    errors.password = password ? undefined : "password invalid";

    if (errors.email || errors.password || errors.username) {
      return res.status(400).json({ success: false, errors });
    }

    const user = await DI.userRepository.find({ email: req.body.email });

    if (user[0]) {
      errors.email = "Email already exists";
      return res.status(400).json({ success: false, errors });
    } else {
      const newUser = DI.em.create(User, {
        username,
        email,
        password,
      });

      bcrypt.genSalt(10, (_err, salt) => {
        bcrypt.hash(newUser.password, salt, async (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          await DI.em.persistAndFlush(newUser);
        });
      });
    }

    return res.status(201).json({ success: true });
  };

  static loginUser = async (
    req: Request<loginRequestDto>,
    res: Response<loginResponseDto>
  ) => {
    const { email, password } = req.body;
    const errors: { message?: string } = {};

    const user = await DI.userRepository.find({ email: email });

    if (!user[0]) {
      errors.message = "Your email or password are incorect";
      return res.status(400).json({ success: false, errors });
    }

    const isSame = await bcrypt.compare(password, user[0].password);
    if (isSame) {
      const payload = {
        id: user[0]._id,
        username: user[0].username,
      };
      const token = jwt.sign(payload, "secret", { expiresIn: 36000 });
      res.json({
        success: true,
        id: user[0]._id,
        username: user[0].username,
        token: "Bearer " + token,
        score: user[0].score
      });
    } else {
      errors.message = "Your email or password are incorect";
      return res.status(400).json({ success: false, errors });
    }
  };

  static currentUser = (req: any, res: Response<currentUserResponseDto>) => {
    res.json(req.user);
  };

}
