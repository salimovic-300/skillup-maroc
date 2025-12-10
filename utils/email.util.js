const nodemailer = require('nodemailer');

// Templates d'emails
const templates = {
  emailVerification: (data) => ({
    subject: 'Vérifiez votre email - SkillUp Maroc',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { color: white; margin: 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #6366f1; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .button:hover { background: #4f46e5; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 SkillUp Maroc</h1>
          </div>
          <div class="content">
            <h2>Bienvenue ${data.name} !</h2>
            <p>Merci de vous être inscrit sur SkillUp Maroc. Pour activer votre compte et accéder à toutes nos formations, veuillez vérifier votre email.</p>
            <center>
              <a href="${data.verificationUrl}" class="button">Vérifier mon email</a>
            </center>
            <p style="color: #6b7280; font-size: 14px;">Ce lien expire dans 24 heures.</p>
            <p>Si vous n'avez pas créé de compte, ignorez simplement cet email.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} SkillUp Maroc. Tous droits réservés.</p>
            <p>Casablanca, Maroc</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  resetPassword: (data) => ({
    subject: 'Réinitialisation de mot de passe - SkillUp Maroc',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { color: white; margin: 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #ef4444; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Réinitialisation</h1>
          </div>
          <div class="content">
            <h2>Bonjour ${data.name},</h2>
            <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
            <center>
              <a href="${data.resetUrl}" class="button">Réinitialiser mon mot de passe</a>
            </center>
            <div class="warning">
              <strong>⚠️ Ce lien expire dans 1 heure.</strong>
            </div>
            <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre mot de passe restera inchangé.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} SkillUp Maroc. Tous droits réservés.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  enrollmentConfirmation: (data) => ({
    subject: `Inscription confirmée - ${data.courseName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { color: white; margin: 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .course-card { background: white; border-radius: 10px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin: 20px 0; }
          .button { display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Inscription Confirmée !</h1>
          </div>
          <div class="content">
            <h2>Félicitations ${data.name} !</h2>
            <p>Votre inscription à la formation a été confirmée.</p>
            <div class="course-card">
              <h3>${data.courseName}</h3>
              <p>Instructeur: ${data.instructor}</p>
              <p>Durée: ${data.duration}</p>
            </div>
            <center>
              <a href="${data.courseUrl}" class="button">Commencer la formation</a>
            </center>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} SkillUp Maroc. Tous droits réservés.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  paymentReceipt: (data) => ({
    subject: `Reçu de paiement #${data.invoiceNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1f2937; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { color: white; margin: 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .invoice-details { background: white; border-radius: 10px; padding: 20px; margin: 20px 0; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
          .total { font-size: 20px; font-weight: bold; color: #10b981; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🧾 Reçu de Paiement</h1>
          </div>
          <div class="content">
            <p>Bonjour ${data.name},</p>
            <p>Merci pour votre achat. Voici votre reçu :</p>
            <div class="invoice-details">
              <p><strong>Facture N°:</strong> ${data.invoiceNumber}</p>
              <p><strong>Date:</strong> ${data.date}</p>
              <table>
                <tr>
                  <th>Formation</th>
                  <th>Prix</th>
                </tr>
                <tr>
                  <td>${data.courseName}</td>
                  <td>${data.amount} ${data.currency}</td>
                </tr>
              </table>
              <p class="total" style="text-align: right; margin-top: 20px;">
                Total: ${data.amount} ${data.currency}
              </p>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} SkillUp Maroc. Tous droits réservés.</p>
            <p>ICE: XXXXXXXXXX | IF: XXXXXXXX</p>
          </div>
        </div>
      </body>
      </html>
    `
  })
};

// Créer le transporteur
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// Fonction principale d'envoi
const sendEmail = async ({ email, subject, template, data, customHtml }) => {
  try {
    const transporter = createTransporter();

    let htmlContent, emailSubject;

    if (template && templates[template]) {
      const templateResult = templates[template](data);
      htmlContent = templateResult.html;
      emailSubject = subject || templateResult.subject;
    } else if (customHtml) {
      htmlContent = customHtml;
      emailSubject = subject;
    } else {
      throw new Error('Template ou HTML personnalisé requis');
    }

    const mailOptions = {
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: emailSubject,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log(`✉️ Email envoyé à ${email}: ${info.messageId}`);
    
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('❌ Erreur envoi email:', error);
    throw error;
  }
};

module.exports = sendEmail;
