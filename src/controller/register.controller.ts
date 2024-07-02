import { Request, Response } from "express";
import { User } from "../entity/User";
import { AppDataSource as dataSource } from "../data-source";
import { handleErrorResponse } from "../utils/handleError";
import { Profile } from "../entity/Profile";
import ImageManager from "../utils/ImageHandler";
import nodemailer from "nodemailer";
import { transporter } from "../mail";

const userRepository = dataSource.getRepository(User);
const profileRepository = dataSource.getRepository(Profile);

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    const { firstName, lastName, avatar } = req.body;
    const { height, weight, bornDate } = req.body;

    if (!username || !email || !password) {
      return handleErrorResponse(
        res,
        "Usuario, email y contraseña requeridos",
        400
      );
    }

    if (!firstName || !lastName || !bornDate) {
      return handleErrorResponse(
        res,
        "Nombre, apellido y fecha de nacimiento requeridos",
        400
      );
    }

    const existUsername = await userRepository.findOneBy({ username });
    if (existUsername) {
      return handleErrorResponse(res, "El usuario ya existe", 400);
    }

    const existEmail = await userRepository.findOneBy({ email });
    if (existEmail) {
      return handleErrorResponse(res, "El email ya existe", 400);
    }

    const newUser = new User();
    newUser.username = username.toString();
    newUser.email = email.toString();
    newUser.password = password.toString();

    const newProfile = new Profile();
    newProfile.firstName = firstName.toString();
    newProfile.lastName = lastName.toString();
    if (height) newProfile.height = parseInt(height.toString());
    if (weight) newProfile.weight = parseInt(weight.toString());
    newProfile.bornDate = new Date(bornDate.toString());
    newProfile.age = Math.floor(
      (Date.now() - newProfile.bornDate.getTime()) / 1000 / 60 / 60 / 24 / 365
    );

    newUser.profile = newProfile;

    await profileRepository.save(newProfile);
    const savedUser = await userRepository.save(newUser);

    if (avatar) {
      let imageManager = new ImageManager();
      newProfile.avatar = imageManager.saveImage(newUser.id, "avatar", avatar);
    } else {
      newProfile.avatar = `${process.env.SERVER_URL}/uploads/avatar.png`;
    }
    await profileRepository.save(newProfile);

    await enviarCorreoRegistro(email.toString());
    res.json(savedUser);
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      handleErrorResponse(res, "El usuario ya existe", 400);
    } else {
      console.log(error);
      handleErrorResponse(res, "Error al guardar el usuario", 500);
    }
  }
};

async function enviarCorreoRegistro(email: string) {
  try {
    await transporter.sendMail({
      from: "'Confirmacion registro' <clout.red.social@gmail.com>",
      to: email,
      subject: "Registro exitoso en nuestra aplicación",
      html: registerHTML,
    });

    console.log("Correo enviado exitosamente");
  } catch (error) {
    console.error("Error al enviar el correo:", error);
  }
}

const registerHTML = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registro Completo</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #1a1a1a;
            color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #333;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #007bff;
            padding: 20px;
            text-align: center;
            color: #ffffff;
        }
        .header h1 {
            margin: 0;
        }
        .content {
            padding: 20px;
        }
        .content p {
            font-size: 16px;
            line-height: 1.5;
            color: #fff;
        }
        .footer {
            text-align: center;
            padding: 10px;
            font-size: 12px;
            color: #bbb;
        }
        a {
            color: #4CAF50;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>¡Registro Completo!</h1>
        </div>
        <div class="content">
            <p>Buenos días,</p>
            <p>Nos complace informarte que te has registrado correctamente en <strong>Clout</strong>.</p>
            <p>Ahora puedes acceder a todas las características y beneficios que ofrecemos.</p>
            <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>
            <p>Gracias por unirte a nosotros.</p>
            <p>Saludos,<br>El equipo de Clout</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 Clout. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>
`;
