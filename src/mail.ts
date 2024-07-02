import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_KEY,
  },
});

export const registerHTML = `
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

export const deleteUserHTML = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Usuario Borrado</title>
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
            <h1>¡Usuario Borrado!</h1>
        </div>
        <div class="content">
            <p>Buenos días,</p>
            <p>Te informamos que tu usuario ha sido borrado correctamente de <strong>Clout</strong>.</p>
            <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>
            <p>Saludos,<br>El equipo de Clout</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 Clout. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>
`;
