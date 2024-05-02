import { Request, Response } from "express";
import { User } from "../entity/User";
import { AppDataSource as dataSource } from "../data-source";
import { handleErrorResponse } from "../utils/handleError";
import { Post } from "../entity/Post";
import ImageManager from "../utils/ImageHandler";
import { PostLikes } from "../entity/PostLikes";
import { Comment } from "../entity/Comment";

const userRepository = dataSource.getRepository(User);
const postRepository = dataSource.getRepository(Post);
const commentRepository = dataSource.getRepository(Comment);
const postLikesRepository = dataSource.getRepository(PostLikes);

export const getAll = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const numericUserId = parseInt(userId);

    const user = await userRepository.findOne({
      where: { id: numericUserId },
      relations: { profile: true },
    });

    if (!user) {
      return handleErrorResponse(res, "Usuario no encontrado", 404);
    }

    const posts = await postRepository.find({
      relations: { user: true, comments: false },
      order: { createdAt: "DESC" },
    });

    if (!posts) {
      return handleErrorResponse(res, "No hay posts", 404);
    }

    const sanitazedPost = await Promise.all(
      posts.map(async (post) => {
        const postUser = await userRepository.findOne({
          where: { id: post.user.id },
          relations: { profile: true },
        });
        return {
          id: post.id,
          text: post.text,
          image: post.image,
          user: {
            username: postUser.username,
            avatar: postUser.profile.avatar,
          },
          likes: post.likes,
          hasLiked: await checkIfUserHasLikedPost(user, post),
        };
      })
    );

    return res.json(sanitazedPost);
  } catch (error) {
    handleErrorResponse(res, "Error al obtener los posts", 500);
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const { id, userId } = req.params;
    const numericId = parseInt(id);

    if (!userId) {
      const post = await postRepository.findOne({
        where: { id: numericId },
        relations: { user: true },
        order: { createdAt: "DESC" },
      });

      const postUser = await userRepository.findOne({
        where: { id: post.user.id },
        relations: { profile: true },
      });

      const sanitizedPost = await {
        id: post.id,
        text: post.text,
        image: post.image,
        user: {
          username: postUser.username,
          avatar: postUser.profile.avatar,
        },
        likes: post.likes,
        hasLiked: false,
      };

      return res.json(sanitizedPost);
    }
    const numericUserId = parseInt(userId);

    const post = await postRepository.findOne({
      where: { id: numericId },
      relations: { user: true },
      order: { createdAt: "DESC" },
    });

    if (!post) {
      return handleErrorResponse(res, "Post no encontrado", 404);
    }

    const user = await userRepository.findOne({
      where: { id: numericUserId },
      relations: { profile: true },
    });

    if (!user) {
      return handleErrorResponse(res, "Usuario no encontrado", 404);
    }

    const postUser = await userRepository.findOne({
      where: { id: post.user.id },
      relations: { profile: true },
    });

    const sanitizedPost = await {
      id: post.id,
      text: post.text,
      image: post.image,
      user: {
        username: postUser.username,
        avatar: postUser.profile.avatar,
      },
      likes: post.likes,
      hasLiked: await checkIfUserHasLikedPost(user, post),
    };

    return res.json(sanitizedPost);
  } catch (error) {
    handleErrorResponse(res, "Error al obtener el post", 500);
  }
};

export const create = async (req: Request, res: Response) => {
  let imageManager = new ImageManager();

  try {
    const { userId, text, image } = req.body;

    const numericId = parseInt(userId);
    const currentUser = await userRepository.findOne({
      where: { id: numericId },
      relations: { profile: true },
    });
    if (!currentUser) {
      return handleErrorResponse(res, "Usuario no encontrado", 404);
    }

    if (!image) {
      return handleErrorResponse(res, "Imagen requerida", 404);
    }

    if (!text) {
      return handleErrorResponse(res, "Texto requerido", 404);
    }

    const newPost = new Post();
    newPost.text = text;
    newPost.image = imageManager.saveImage(
      userId,
      `${Math.random().toString(36).substring(2)}`,
      image
    );
    newPost.user = currentUser;

    const post = await postRepository.save(newPost);

    const sanitizedPost = await {
      id: post.id,
      text: post.text,
      image: post.image,
      user: {
        username: currentUser.username,
        avatar: currentUser.profile.avatar,
      },
      likes: post.likes,
      hasLiked: await checkIfUserHasLikedPost(currentUser, post),
      comments: post.comments,
    };

    res.json(sanitizedPost);
  } catch (error) {
    console.log(error);
    handleErrorResponse(res, "Error al crear el post", 500);
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { text, image } = req.body;

    const post = await postRepository.findOne({
      where: { id: parseInt(id) },
      relations: { user: true, comments: true },
    });

    if (!post) {
      return handleErrorResponse(res, "Post no encontrado", 404);
    }

    if (!text) {
      return handleErrorResponse(res, "Texto requeridos", 400);
    }

    if (text) {
      post.text = text;
    }

    const updatedPost = await postRepository.save(post);

    const currentUser = await userRepository.findOne({
      where: { id: post.user.id },
      relations: { profile: true },
    });

    const sanitizedPost = await {
      id: post.id,
      text: post.text,
      image: post.image,
      user: {
        username: currentUser.username,
        avatar: currentUser.profile.avatar,
      },
      likes: post.likes,
      hasLiked: await checkIfUserHasLikedPost(currentUser, post),
      comments: post.comments,
    };
    return res.json(sanitizedPost);
  } catch (error) {
    console.log(error);
    handleErrorResponse(res, "Error al actualizar el post", 500);
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let numericId = parseInt(id);

    const post = await postRepository.findOne({
      where: { id: numericId },
      relations: { comments: true },
    });

    if (!post) return handleErrorResponse(res, "Post no encontrado", 404);

    for (let comment of post.comments) {
      await commentRepository.remove(comment);
    }

    await postRepository.remove(post);
    return res.json(`Post ${numericId} eliminado`);
  } catch (error) {
    console.log(error);
    handleErrorResponse(res, "Error al borrar el post", 500);
  }
};

export const deletePostAndComments = async (postId: number) => {
  const post = await postRepository.findOne({
    where: { id: postId },
    relations: { comments: true },
  });

  if (!post) return;

  for (let comment of post.comments) {
    await commentRepository.remove(comment);
  }

  await postRepository.remove(post);
  return `Post ${postId} eliminado`;
};

export const like = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const numericId = parseInt(id);

    const userId = req.body.userId;
    const numericUserId = parseInt(userId);

    if (!userId) {
      return handleErrorResponse(res, "Usuario requerido", 400);
    }

    const post = await postRepository.findOne({
      where: { id: numericId },
    });

    if (!post) {
      return handleErrorResponse(res, "Post no encontrado", 404);
    }

    const user = await userRepository.findOne({
      where: { id: numericUserId },
    });

    if (!user) {
      return handleErrorResponse(res, "Usuario no encontrado", 404);
    }

    // Verificar si el usuario ya le dio like al post
    const existingLike = await postLikesRepository.query(
      `SELECT * FROM post_likes WHERE userId = ${numericUserId} AND postId = ${numericId}`
    );

    if (existingLike.length > 0) {
      return handleErrorResponse(res, "Ya diste like a este post", 400);
    }

    // Crear un nuevo like y asociarlo al post
    let postLikes = new PostLikes();
    postLikes.user = user;
    postLikes.post = post;
    await postLikesRepository.save(postLikes);

    // Opcional: Incrementar el contador de likes en el post si tienes un campo para ello
    post.likes = (post.likes || 0) + 1;
    await postRepository.save(post);

    return res.json({ message: "Like exitoso" });
  } catch (error) {
    console.log(error);
    handleErrorResponse(res, "Error al dar like", 500);
  }
};
export const unlike = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const numericId = parseInt(id);

    const userId = req.body.userId;
    const numericUserId = parseInt(userId);

    if (!userId) {
      return handleErrorResponse(res, "Usuario requerido", 400);
    }

    const post = await postRepository.findOne({
      where: { id: numericId },
    });

    if (!post) {
      return handleErrorResponse(res, "Post no encontrado", 404);
    }

    const user = await userRepository.findOne({
      where: { id: numericUserId },
    });

    if (!user) {
      return handleErrorResponse(res, "Usuario no encontrado", 404);
    }

    const existingLike = await postLikesRepository.query(
      `SELECT * FROM post_likes WHERE userId = ${numericUserId} AND postId = ${numericId}`
    );

    if (existingLike.length !== 1) {
      return handleErrorResponse(res, "Like no encontrado", 404);
    }

    await postLikesRepository.remove(existingLike);

    post.likes = Math.max((post.likes || 0) - 1, 0);
    await postRepository.save(post);

    return res.json({ message: "Unlike exitoso" });
  } catch (error) {
    console.log(error);
    handleErrorResponse(res, "Error al dar unlike", 500);
  }
};
export const comment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const numericId = parseInt(id);

    const { userId, text } = req.body;
    const numericUserId = parseInt(userId);

    if (!userId) {
      return handleErrorResponse(res, "Usuario requerido", 400);
    }

    let post = await postRepository.findOne({
      where: { id: numericId },
    });

    if (!post) {
      return handleErrorResponse(res, "Post no encontrado", 404);
    }

    const user = await userRepository.findOne({
      where: { id: numericUserId },
      relations: { profile: true },
    });

    if (!user) {
      return handleErrorResponse(res, "Usuario no encontrado", 404);
    }

    let comment = new Comment();
    comment.user = user;
    comment.post = post;
    comment.text = text;
    comment.username = user.username;
    comment.avatar = user.profile.avatar;

    let commentSaved = await commentRepository.save(comment);

    return res.json(commentSaved);
  } catch (error) {
    console.log(error);
    handleErrorResponse(res, "Error al comentar", 500);
  }
};

export const uncomment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const numericId = parseInt(id);

    if (!id) {
      return handleErrorResponse(res, "ID de comentario requerido", 400);
    }

    let comment = await commentRepository.findOne({
      where: { id: numericId },
    });

    if (!comment) {
      return handleErrorResponse(res, "Comentario no encontrado", 404);
    }

    await commentRepository.remove(comment);

    return res.json({ message: "Comentario eliminado exitosamente" });
  } catch (error) {
    console.error(error);
    handleErrorResponse(res, "Error al descomentar", 500);
  }
};

export const getPosts = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const numericUserId = parseInt(userId);

    const user = await userRepository.findOne({
      where: { id: numericUserId },
      relations: { profile: true },
    });

    if (!user) {
      return handleErrorResponse(res, "Usuario no encontrado", 404);
    }

    const posts = await postRepository.find({
      relations: { user: true },
      order: { createdAt: "DESC" },
    });

    if (posts.length === 0) {
      return handleErrorResponse(res, "No hay posts", 404);
    }

    // Filter the posts to only return the ones created by the user
    const filteredPosts = posts.filter((post) => post.user.id === user.id);

    const sanitazedPost = await Promise.all(
      filteredPosts.map(async (post) => {
        return {
          id: post.id,
          text: post.text,
          image: post.image,
          user: {
            username: user.username,
            avatar: user.profile.avatar,
          },
          likes: post.likes,
          hasLiked: await checkIfUserHasLikedPost(user, post),
        };
      })
    );

    return res.json(sanitazedPost);
  } catch (error) {
    console.error(error);
    handleErrorResponse(res, "Error al obtener los posts", 500);
  }
};

const checkIfUserHasLikedPost = async (user: User, post: Post) => {
  const liked = await postLikesRepository.query(
    `SELECT * FROM post_likes WHERE userId = ${user.id} AND postId = ${post.id}`
  );
  if (liked.length > 0) {
    return true;
  }
  return false;
};
export const getLikes = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const numericUserId = parseInt(userId);

    const user = await userRepository.findOne({
      where: { id: numericUserId },
    });

    if (!user) {
      return handleErrorResponse(res, "Usuario no encontrado", 404);
    }

    const likes = await postLikesRepository.query(
      `SELECT * FROM post_likes WHERE userId = ${user.id}`
    );

    console.log(likes);

    if (likes.length === 0) {
      return handleErrorResponse(res, "No hay posts con likes", 404);
    }

    const sanitazedLikes = await Promise.all(
      likes.map(async (like) => {
        const post = await postRepository.findOne({
          where: { id: like.postId },
          relations: { user: true },
        });
        const postUser = await userRepository.findOne({
          where: { id: post.user.id },
          relations: { profile: true },
        });
        return {
          id: post.id,
          text: post.text,
          image: post.image,
          user: {
            username: postUser.username,
            avatar: postUser.profile.avatar,
          },
          likes: post.likes,
          hasLiked: await checkIfUserHasLikedPost(user, post),
        };
      })
    );

    return res.json(sanitazedLikes);
  } catch (error) {
    console.error(error);
    handleErrorResponse(
      res,
      "Error al obtener los post a los que se le ha dado likes",
      500
    );
  }
};

export const getComments = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const numericId = parseInt(id);

    const post = await postRepository.findOne({
      where: { id: numericId },
      relations: { comments: true },
    });

    return res.json(post.comments);
  } catch (error) {
    console.error(error);
    handleErrorResponse(res, "Error al obtener los comentarios", 500);
  }
};
