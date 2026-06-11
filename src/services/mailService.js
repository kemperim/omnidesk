const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

exports.sendInvite = async ({ email, name, subdomain, token, role }) => {
  const link = `http://localhost:3000/invite?token=${token}`;

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    subject: 'Приглашение в Omnidesk',
    html: `
      <h2>Вас пригласили в систему Omnidesk</h2>
      <p>Роль: <b>${role}</b></p>
      <p>Для активации аккаунта перейдите по ссылке:</p>
      <a href="${link}">${link}</a>
      <p>Ссылка действительна 48 часов.</p>
    `
  });
};