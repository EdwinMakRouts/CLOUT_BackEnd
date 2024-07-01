import { Request, Response } from "express";
import { User } from "../entity/User";
import { Followers } from "../entity/Followers";
import { AppDataSource as dataSource } from "../data-source";
import { handleErrorResponse } from "../utils/handleError";

const userRepository = dataSource.getRepository(User);
const followersRepository = dataSource.getRepository(Followers);

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userRepository.find({
      relations: { profile: true },
    });
    const sanitizedUsers = users.map((user) => {
      return {
        id: user.id,
        username: user.username,
        avatar: user.profile.avatar,
      };
    });
    return res.json(sanitizedUsers);
  } catch (error) {
    handleErrorResponse(res, "Error al obtener los usuarios", 500);
  }
};

// Usuarios a los que sigue el usuario con el id especificado
export const getFollowing = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const numericId = parseInt(id);

    const users = await followersRepository.find({
      where: { followerId: numericId },
      relations: { user: true },
    });

    if (users.length === 0) return res.json([]);

    const sanitazedFollowers = await Promise.all(
      users.map(async (follower) => {
        const user = await userRepository.findOne({
          where: { id: follower.followingId },
          relations: { profile: true },
        });
        return {
          id: follower.followingId,
          username: user.username,
          avatar: user.profile.avatar,
        };
      })
    );

    return res.json(sanitazedFollowers);
  } catch (error) {
    console.log(error);
    handleErrorResponse(
      res,
      "Error al obtener los followers del id especificado",
      500
    );
  }
};

// Usuarios que siguen al usuario con el id especificado
export const getFollowers = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const numericId = parseInt(id);

    const followers = await followersRepository.find({
      where: { followingId: numericId },
      relations: { user: true },
    });

    if (followers.length === 0)
      return handleErrorResponse(res, "Nadie te esta siguiendo 🥹", 404);

    const sanitazedFollowers = await Promise.all(
      followers.map(async (follower) => {
        const user = await userRepository.findOne({
          where: { id: follower.followerId },
          relations: { profile: true },
        });
        return {
          id: follower.followerId,
          username: user.username,
          avatar: user.profile.avatar,
        };
      })
    );
    return res.json(sanitazedFollowers);
  } catch (error) {
    handleErrorResponse(
      res,
      "Error al obtener los usarios que sigue el usuaio del id especificado",
      500
    );
  }
};

export const follow = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const numericId = parseInt(id);

    const { followerId } = req.body;

    const user = await userRepository.findOne({
      where: { id: numericId },
      relations: { profile: true },
    });

    if (!user) return handleErrorResponse(res, "Usuario no encontrado", 404);
    if (user.id === followerId)
      return handleErrorResponse(res, "No puedes seguirte a ti mismo", 400);
    if (
      await followersRepository.findOne({
        where: { followingId: numericId, followerId: followerId },
      })
    )
      return handleErrorResponse(res, "Ya sigues a este usuario", 400);

    const newFollower = new Followers();
    newFollower.user = user;
    newFollower.followingId = numericId;
    newFollower.followerId = followerId;

    const follower = await followersRepository.save(newFollower);

    return res.json(follower);
  } catch (error) {
    handleErrorResponse(res, "Error al seguir al usuario", 500);
  }
};

export const unfollow = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const numericId = parseInt(id);
    const { followerId } = req.body;
    const user = await userRepository.findOne({ where: { id: numericId } });

    if (!user) return handleErrorResponse(res, "Usuario no encontrado", 404);
    if (user.id === followerId)
      return handleErrorResponse(res, "No puedes seguirte a ti mismo", 400);

    let follow = await followersRepository.findOne({
      where: { followingId: numericId, followerId: followerId },
    });

    if (follow) {
      await followersRepository.remove(follow);

      return res.json(
        "El usuario con el id " +
          followerId +
          " ha dejado de seguir al usuario especificado con el id " +
          id
      );
    } else {
      return handleErrorResponse(res, "No sigues a este usuario", 400);
    }
  } catch (error) {
    handleErrorResponse(res, "Error al dejar de seguir al usuario", 500);
  }
};
export const isFollowing = async (req: Request, res: Response) => {
  try {
    const { id, userId } = req.params;
    if (!id || !userId)
      return handleErrorResponse(res, "Faltan parametros", 400);

    const numericId = parseInt(id);
    const numericUserId = parseInt(userId);

    const follow = await followersRepository.findOne({
      where: { followingId: numericId, followerId: numericUserId },
    });

    if (follow) {
      return res.json({ isFollowing: true });
    } else {
      return res.json({ isFollowing: false });
    }
  } catch (error) {
    handleErrorResponse(res, "Error al verificar si el usuario sigue", 500);
  }
};
