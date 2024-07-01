import { Request, Response } from "express";
import { User } from "../entity/User";
import { AppDataSource as dataSource } from "../data-source";
import { handleErrorResponse } from "../utils/handleError";
import { Chat } from "../entity/Chat";
import { Message } from "../entity/Message";
import { Tree } from "typeorm";

const chatRepository = dataSource.getRepository(Chat);
const messageRepository = dataSource.getRepository(Message);
const userRepository = dataSource.getRepository(User);

export const getChatsOfUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const numericId = parseInt(id);

    const chats = await chatRepository.find({
      where: [{ userId_1: numericId }, { userId_2: numericId }],
      relations: ["messages"],
    });

    return res.json(chats);
  } catch (error) {
    handleErrorResponse(res, "Error al obtener los chats", 500);
  }
};

export const createMessage = async (req: Request, res: Response) => {
  try {
    const { myId, hisId, message } = req.body;

    const chat = await chatRepository.findOne({
      where: [
        { userId_1: myId, userId_2: hisId },
        { userId_1: hisId, userId_2: myId },
      ],
    });

    const date = new Date();

    if (!chat) {
      const newChat = chatRepository.create({
        userId_1: myId,
        userId_2: hisId,
        lastMessageDate: date,
        lastConnectionUser_1: date,
      });

      await chatRepository.save(newChat);

      const newMessage = messageRepository.create({
        chat: newChat,
        message,
        userId: myId,
        createdAt: date,
      });

      await messageRepository.save(newMessage);

      return res.json(newMessage);
    } else {
      const newMessage = messageRepository.create({
        chat: chat,
        message,
        userId: myId,
        createdAt: date,
      });

      await messageRepository.save(newMessage);

      chat.lastMessageDate = date;

      if (chat.userId_1 === myId) {
        chat.lastConnectionUser_1 = date;
      } else {
        chat.lastConnectionUser_2 = date;
      }

      await chatRepository.save(chat);

      return res.json(newMessage);
    }
  } catch (error) {
    handleErrorResponse(res, "Error al crear el mensaje", 500);
  }
};

export const deleteMessage = async (req: Request, res: Response) => {
  try {
    //Se le pasa directamente el id del mensaje a eliminar
    const { id } = req.params;
    const numericId = parseInt(id);
    const message = await messageRepository.find({
      where: { id: numericId },
    });

    if (message) {
      await messageRepository.delete(numericId);
      return res.json({ message: "Mensaje eliminado" });
    } else {
      handleErrorResponse(res, "Mensaje no encontrado", 404);
    }
  } catch (error) {
    handleErrorResponse(res, "Error al eliminar el mensaje", 500);
  }
};

export const updateLastConnection = async (req: Request, res: Response) => {
  try {
    const { id, chatId } = req.params;
    const numericId = parseInt(id);
    const numericChatId = parseInt(chatId);

    const chat = await chatRepository.findOne({
      where: { id: numericChatId },
    });

    console.log(chat);

    if (chat) {
      const date = new Date();

      if (chat.userId_1 === numericId) {
        chat.lastConnectionUser_1 = date;
      } else {
        chat.lastConnectionUser_2 = date;
      }

      await chatRepository.save(chat);
      return res.json({ message: "Última conexión actualizada" });
    } else {
      handleErrorResponse(res, "Chat no encontrado", 404);
    }
  } catch (error) {
    handleErrorResponse(res, "Error al actualizar la última conexión", 500);
  }
};

export const isThereNewMessagesInChat = async (req: Request, res: Response) => {
  try {
    const { id, chatId } = req.params;
    const numericId = parseInt(id);
    const numericChatId = parseInt(chatId);

    if (numericChatId != 0) {
      const chat = await chatRepository.findOne({
        where: { id: numericChatId },
      });

      if (chat) {
        if (chat.userId_1 == numericId) {
          if (chat.lastConnectionUser_1 < chat.lastMessageDate) {
            return res.json({ newMessages: true });
          } else {
            return res.json({ newMessages: false });
          }
        } else if (chat.userId_2 == numericId) {
          if (chat.lastConnectionUser_2 < chat.lastMessageDate) {
            return res.json({ newMessages: true });
          } else {
            return res.json({ newMessages: false });
          }
        } else {
          handleErrorResponse(res, "No tienes acceso a este chat", 403);
        }
      } else {
        handleErrorResponse(res, "Chat no encontrado", 404);
      }
    } else {
      const chats = await chatRepository.find({
        where: [{ userId_1: numericId }, { userId_2: numericId }],
      });

      for (let chat of chats) {
        if (chat.userId_1 == numericId) {
          if (chat.lastConnectionUser_1 < chat.lastMessageDate) {
            return res.json({ newMessages: true });
          }
        } else if (chat.userId_2 == numericId) {
          if (chat.lastConnectionUser_2 < chat.lastMessageDate) {
            return res.json({ newMessages: true });
          }
        }
      }
      return res.json({ newMessages: false });
    }
  } catch (error) {
    handleErrorResponse(res, "Error al comprobar nuevos mensajes", 500);
  }
};

export const deleteAllChats = async (req: Request, res: Response) => {
  try {
    const chats = await chatRepository.find({
      relations: { messages: true },
    });
    for (let chat of chats) {
      for (let message of chat.messages) {
        await messageRepository.remove(message);
      }
      await chatRepository.remove(chat);
    }

    return res.json({ message: "Todos los chats han sido eliminados" });
  } catch (error) {
    handleErrorResponse(res, "Error al eliminar los chats", 500);
  }
};
