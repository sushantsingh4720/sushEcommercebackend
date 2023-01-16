const nodeMailer=require("nodemailer")

const sendEmail=async(options)=>{
const transporter=nodeMailer.createTransport({
    host:process.env.SMPT_HOST,
    port:process.env.SMPT_PORT,
    secure: false,
    service:process.SMPT_SERVICE,
//SMPT_MAIL generate by site https://ethereal.email/

    auth:{
        user:process.env.SMPT_MAIL,
        pass:process.env.SMPT_PASSWORD,
    }
})
const mailOptions={
    form:process.env.SMPT_MAIL,
    to:options.email,
    subject:options.subject,
    text:options.message,
}
await transporter.sendMail(mailOptions)

}

module.exports=sendEmail