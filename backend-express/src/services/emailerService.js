const nodemailer = require("nodemailer");

//const {serverBaseUrl, resetPasswordPagePath} = 
//require('../../config/server').urls;

class Emailer {

    constructor(host, port, userName, password, isSecure) {
    this.userName = userName || process.env.EMAIL_USER;
    this.transporter = nodemailer.createTransport({
        host: host || process.env.EMAIL_HOST,
        port: port || process.env.EMAIL_PORT,
        secure: isSecure || true,
        auth: {
        user: this.userName,
        pass: password || process.env.EMAIL_PASSWORD
        },
    });
    }

   static  async sendMail(to, subject, text, html, attachmentsUrls) {
        try {
        let attachments = [];
        if(attachmentsUrls && attachmentsUrls.length)
            attachmentsUrls.forEach(url => attachments.push({path: url}));
           
        let info = await this.transporter.sendMail({
        from: this.userName,
        to,
        subject,
        text,
        html,
        attachments
        });

       
        return true;

    } catch(err) {
        return false;
    }
    }

   static sendActivationCode (
    userFirstName, userLastName, userEMail, activationCode
    ) {

    let mailBodyHtml = 
        `Dear <b>${userFirstName} ${userLastName},</b>
        <p>Thank you for your registeration in our platform,</p>
        <p>To activate your new account, please enter the follwing code in the activation form:</p>
        <p><b>${activationCode}</b></p>
        <p>Best regards.</p>`;

    this.sendMail(
        userEMail,
        `Banan Account Activation`,
        null,
        mailBodyHtml
    );

    }

    // sendResetPasswordLink (
    // userFirstName, userLastName, userEMail, resetCode
    // ) {
    // const resetUrl = 
    //     `${serverBaseUrl}${resetPasswordPagePath}/${resetCode}`;

    // let mailBodyHtml = 
    //     `Dear <b>${userFirstName} ${userLastName},</b>
    //     <p>Please follow the link below in order to reset your new account's password:</p>
    //     <p><a href="${resetUrl}">${resetUrl}</a></p>
    //     <p>Copy rest Code : ${resetCode}</p>
    //     <p>Best regards.</p>`;

    // this.sendMail(
    //     userEMail,
    //     `Banan Reset Password`,
    //     null,
    //     mailBodyHtml
    // );

    // }

    async sendConfirmCode ({code, email}) {

    let mailBodyHtml = 
        `<p>Thank you for your registeration in our platform,</p>
        <p>To Confirm your Email, please enter the follwing code in the Confirmation form:</p>
        <p><b>${code}</b></p>
        <p>Best regards.</p>`;

    await this.sendMail(
        email,
        `Banan Email Confirmation`,
        null,
        mailBodyHtml
    );

    }

    async sendAuthinfo ({loginName, password}) {

    let mailBodyHtml = 
        `<p>Thank you for your registeration in our platform</p>
        <p>The following is your credentials, Keep it secret and do not share it</p>
        <p><b>Login Name</b>: ${loginName}</p>
        <p><b>Password</b>: ${password}</p>
        <p>Best Regards.</p>`;

    await this.sendMail(
        loginName,
        `banan User Credentials`,
        null,
        mailBodyHtml
    );
    }
}

module.exports = {
  create: () => new Emailer
};