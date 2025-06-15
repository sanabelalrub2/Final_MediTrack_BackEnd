import nodemailer from "nodemailer";





export async function sendEmail(to, subject, html) {

    const transporter = nodemailer.createTransport({

        service: "gmail",

        auth: {

            user: 'sanabelalrub@gmail.com',



            pass: 'ynmf wxuf dglu qaqs',



        },



    });




    const info = await transporter.sendMail({

        from: ' "MediTrack" <${process.env.SENDER_EMAIL}>',

        to: to, // List of receivers

        subject: subject, // Subject Line

        html: html,
    });

    return info;

}