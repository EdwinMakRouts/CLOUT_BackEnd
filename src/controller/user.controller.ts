import { Request, Response } from "express";
import { User } from "../entity/User";
import { AppDataSource as dataSource } from "../data-source";
import { handleErrorResponse } from "../utils/handleError";
import { Profile } from "../entity/Profile";
import { Equal } from "typeorm";
import { ImageHandler } from "../utils/ImageHandler";

const userRepository = dataSource.getRepository(User);
const profileRepository = dataSource.getRepository(Profile);

export const all = async (req: Request, res: Response) => {
  try {
    const users = await userRepository.find({
      relations: { profile: true },
    });
    return res.json(users);
  } catch (error) {
    handleErrorResponse(res, "Error al obtener los usuarios", 500);
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const numericId = parseInt(id);
    const user = await userRepository.findOneBy({ id: numericId });

    if (user) {
      return res.json(user);
    } else {
      handleErrorResponse(res, "User no encontrado", 404);
    }
  } catch (error) {
    handleErrorResponse(res, "Error al obtener el usuario", 500);
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const {
      username,
      password,
      email,
      firstName,
      lastName,
      avatar,
      height,
      weight,
      bornDate,
    } = req.body;

    const numericId = parseInt(userId);
    const user = await userRepository.findOne({
      where: { id: numericId },
      relations: { profile: true },
    });

    if (!user) return handleErrorResponse(res, "Usuario no encontrado", 404);

    const profile = user.profile;
    if (username) user.username = username;
    if (password) user.password = password;
    if (email) user.email = email;
    if (firstName) profile.firstName = firstName;
    if (lastName) profile.lastName = lastName;
    if (avatar) profile.avatar = ImageHandler.decodeBase64ToBuffer(avatar);
    if (height) profile.height = height;
    if (weight) profile.weight = weight;
    if (bornDate) {
      profile.bornDate = new Date(bornDate);
      profile.age = Math.floor(
        (Date.now() - profile.bornDate.getTime()) / 1000 / 60 / 60 / 24 / 365
      );
    }
    user.profile = profile;
    userRepository.save(user);

    res.json(user);
  } catch (error) {
    handleErrorResponse(res, "Error al actualizar el usuario", 500);
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const numericId = parseInt(id);

    const user = await userRepository.findOne({
      where: { id: numericId },
      relations: { profile: true },
    });

    if (!user) return handleErrorResponse(res, "Usuario no encontrado", 404);

    await profileRepository.remove(user.profile);
    await userRepository.remove(user);

    return res.json("Usuario eliminado");
  } catch (error) {
    handleErrorResponse(res, "Error al eliminar el usuario", 500);
  }
};

export const checkUsername = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const user = await userRepository.findOneBy({ username: username });

    console.log(user);
    if (user) {
      return res.json({ exist: true });
    } else {
      return res.status(404).json({ exist: false });
    }
  } catch (error) {
    handleErrorResponse(res, "Error al verificar el usuario", 500);
  }
};

export const checkEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    const user = await userRepository.findOneBy({ email: email });

    if (user) {
      return res.json({ exist: true });
    } else {
      return res.status(404).json({ exist: false });
    }
  } catch (error) {
    handleErrorResponse(res, "Error al verificar el email", 500);
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const numericId = parseInt(id);
    let user;

    if (isNaN(Number(id))) {
      const username = String(id);

      user = await userRepository.find({
        where: { username: Equal(username) },
        relations: { profile: true },
      });
    } else {
      const numericId = parseInt(id);

      user = await userRepository.find({
        where: { id: numericId },
        relations: { profile: true },
      });
    }

    if (user.length == 1) {
      const sanitizedUsers = user.map((user) => {
        const { id, username, email, profile } = user;
        return {
          id,
          username,
          email,
          avatar: profile.avatar,
          firstName: profile.firstName,
          lastName: profile.lastName,
          age: profile.age,
          height: profile.height,
          weight: profile.weight,
          bornDate: profile.bornDate,
        };
      });

      return res.json(sanitizedUsers[0]);
    } else {
      handleErrorResponse(res, "Usuario no encontrado", 404);
    }
  } catch (error) {
    handleErrorResponse(res, "Error al solicitar el perfil", 500);
  }
};
