import { Request, Response } from "express";

import { AppDataSource as dataSource } from "../data-source";
import { handleErrorResponse } from "../utils/handleError";
import { Events } from "../entity/Events";
import { Post } from "../entity/Post";
import { User } from "../entity/User";

const eventRepository = dataSource.getRepository(Events);
const postRepository = dataSource.getRepository(Post);
const userRepository = dataSource.getRepository(User);

export const all = async (req: Request, res: Response) => {
  try {
    const events = await eventRepository.find({
      relations: { post: true },
    });

    return res.json(events);
  } catch (error) {
    handleErrorResponse(res, "Error al obtener los eventos", 500);
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const numericId = parseInt(id);
    const event = await eventRepository.findOne({
      where: { id: numericId },
    });

    if (event) {
      await eventRepository.remove(event);
      return res.json({ message: "Evento eliminado" });
    } else {
      handleErrorResponse(res, "Evento no encontrado", 404);
    }
  } catch (error) {
    handleErrorResponse(res, "Error al eliminar el evento", 500);
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const { title, description, location, postId, friendsId } = req.body;

    if (!title || !postId) {
      handleErrorResponse(res, "Faltan campos obligatorios", 400);
      return;
    }

    const newEvent = new Events();
    newEvent.title = title;

    const post = await postRepository.findOne({
      where: { id: postId },
      relations: { user: true, events: true },
    });

    newEvent.ownerId = post.user.id;
    newEvent.post = post;

    if (description) newEvent.description = description;

    if (location) newEvent.location = location;

    if (friendsId) {
      const auxFriendsId = [];
      for (let friendId of friendsId) {
        auxFriendsId.push(friendId);
      }
      newEvent.friendsId = auxFriendsId;
    }

    await eventRepository.save(newEvent);
    return res.json(newEvent);
  } catch (error) {
    handleErrorResponse(res, "Error al crear el evento", 500);
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const numericId = parseInt(id);
    const { title, description, location, friendsId } = req.body;

    const event = await eventRepository.findOne({
      where: { id: numericId },
      relations: { post: true },
    });

    if (!event) {
      handleErrorResponse(res, "Evento no encontrado", 404);
      return;
    }

    if (title) event.title = title;
    if (description) event.description = description;
    if (location) event.location = location;

    if (friendsId) {
      const auxFriendsId = [];
      for (let friendId of friendsId) {
        auxFriendsId.push(friendId);
      }
      event.friendsId = auxFriendsId;
    }

    await eventRepository.save(event);
    return res.json(event);
  } catch (error) {
    handleErrorResponse(res, "Error al actualizar el evento", 500);
  }
};
