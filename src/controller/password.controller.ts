import { Request, Response } from "express";
import { Post } from "../entity/Post";
import { User } from "../entity/User";
import { AppDataSource as dataSource } from "../data-source";
import { handleErrorResponse } from "../utils/handleError";
import { passwordResetHTML, transporter } from "../mail";
import { Code } from "../entity/Code";

const userRepository = dataSource.getRepository(User);
const codeRepository = dataSource.getRepository(Code);

export const forgot = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return handleErrorResponse(res, "Email requerido", 400);
  }

  const user = await userRepository.find({
    where: { email: email },
  });

  if (!user) {
    return handleErrorResponse(res, "Usuario no encontrado", 400);
  }

  const code = await codeRepository.findOne({
    where: { email: email },
  });

  if (code) await codeRepository.delete(code.id);

  let codigo = String(Math.floor(Math.random() * 10000));
  const formattedNumber = codigo.padStart(4, "0");

  const newCode = new Code();
  newCode.email = email;
  newCode.code = Number(formattedNumber);

  await codeRepository.save(newCode);
  enviarCodigoReseteo(email, Number(formattedNumber));

  res.json({ message: "Código enviado al correo" });
};

export const code = async (req: Request, res: Response) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return handleErrorResponse(res, "Email y código requeridos", 400);
  }

  const codeFound = await codeRepository.findOneBy({ email, code });

  if (!codeFound) {
    return handleErrorResponse(res, "Código incorrecto", 400);
  }

  res.json({ message: "Código correcto" });
};

export const reset = async (req: Request, res: Response) => {
  const { email, code, password } = req.body;
  if (!email || !code || !password) {
    return handleErrorResponse(
      res,
      "Email, código y contraseña requeridos",
      400
    );
  }

  const user = await userRepository.findOne({
    where: { email: email },
  });

  if (!user) {
    return handleErrorResponse(res, "Usuario no encontrado", 400);
  }

  const codeFound = await codeRepository.findOneBy({ email, code });

  if (!codeFound) {
    return handleErrorResponse(res, "Código incorrecto", 400);
  }

  if (codeFound.email !== user.email) {
    return handleErrorResponse(res, "El código no corresponde al usuario", 400);
  }

  user.password = password;
  await userRepository.save(user);
  await codeRepository.delete(codeFound.id);

  res.json({ message: "Contraseña actualizada correctamente" });
};

async function enviarCodigoReseteo(email: string, code: number) {
  try {
    await transporter.sendMail({
      from: "'Código para resetar contraseña' <clout.red.social@gmail.com>",
      to: email,
      subject:
        "Código para resetear contraseña de tu usuario en nuestra aplicación",
      html: passwordResetHTML.replace("[CÓDIGO]", code.toString()),
    });

    console.log("Correo enviado exitosamente");
  } catch (error) {
    console.error("Error al enviar el correo:", error);
  }
}
