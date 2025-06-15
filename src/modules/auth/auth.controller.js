import userModel from "../../../DB/models/user.model.js";
import { sendEmail } from "../../utils/sendEmail.js";
import bcryptjs from "bcryptjs";
import jwt from 'jsonwebtoken';
import { customAlphabet } from 'nanoid';
import { sendNotification } from "../../utils/sendNotification.js";




export const register = async (req, res, next) => {

    const { userName, email, password ,emergencyEmail ,fcmToken} = req.body;
  
    const user = await userModel.findOne({ email });

    const token = jwt.sign({ email }, process.env.CONFIRMEMAILSIGNAL);
    if (user) {

        return res.status(404).json({ message: "Email already registered" });

    }

    const hashedpassword = await bcryptjsjs.hash(password, parseInt(process.env.SALT_ROUND));

    const html = `<div>
  <h1>Welcome ${userName}</h1>
  <a href="http://localhost:7000/auth/confirmemail/${token}">Confirm Email</a>
</div>`;






    await sendEmail(email, "confirm email", html);
    const createdUser = await userModel.create({ userName, email, password: hashedpassword,fcmToken });
    return res.status(200).json({ message: "success", user: createdUser });
  /* return res.status(200).json({ message: "success", user: createdUser, token });*/


}
 
export const confirmEmail = async (req, res) => {
    const { token } = req.params;

    try {
        const decode = jwt.verify(token, process.env.CONFIRMEMAILSIGNAL);
        const user = await userModel.findOneAndUpdate(
            { email: decode.email },
            { confirmEmail: true },
            { new: true }
        );

        return res.status(200).json({ message: "Email confirmed", user });
    } catch (error) {
        return res.status(400).json({ message: "Invalid or expired token" });
        
    }
    return res.status(200).json({ message: "success", user: createdUser, token });  

}




export const login = async (req, res) => {

    const { email, password ,fcmToken} = req.body;

    const user = await userModel.findOne({ email:email });
    if (!user) {

        return res.status(400).json({ message: "Invalid Data" });

    }

    if (!user.confirmEmail) {
        return res.status(400).json({ message: " confirm Your Email" });
    }

    const match =bcryptjs.compare(password, user.password);
    if (!match) {
        return res.status(400).json({ message: " Invalid Data" });
    }




    const token = jwt.sign({id:user.id, user:user,fcmToken }, process.env.LOGIN_SIGNAL);

    return res.status(200).json({ message: "Login successful", token });

}





/*
export const sendCode = async (req, res) => {

    const { email, password } = req.body;
    const code = customAlphabet('1234567890abcdefABCDEF', 4);
    return res.json({ code: code() });
    await userModel.findOneAndUpdate({ email }, { sendCode: code });
    
    const htm = `
    
    <h2>code is ${code}</h2>
    
    `;
    await sendEmail(email, "Rest Password", html);

    return res.status(200).json({ message: " success" });

}
*/ 

export const sendCode = async (req, res) => {
    const { email } = req.body;

     
    const generateCode = customAlphabet('1234567890abcdefABCDEF', 4);
    const code = generateCode();
 
    await userModel.findOneAndUpdate({ email }, { sendCode: code });

     
    const html = `<h2>Your code is: ${code}</h2>`;
    await sendEmail(email, "Reset Password Code", html);
 
    return res.status(200).json({ message: "Code sent successfully" });
};


export const verifyCode = async (req, res) => {
  const { email, code } = req.body;
 
  const user = await userModel.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Account not registered" });
  }

  
  if (user.sendCode !== code) {
    return res.status(400).json({ message: "Invalid verification code" });
  }
 
  return res.status(200).json({ message: "Code verified successfully" });
};

export const resetPassword = async (req, res) => {

    const {email, password} = req.body;

    const user = await userModel.findOne({ email });


    if (!user) {



        return res.status(400).json({ message: "not register account" });
    }
    if (user.sendCode != code) {



        return res.status(400).json({ message: "invalid code" });

    } 

     const hashedPassword = await bcryptjs.hash(password, parseInt(process.env.SALT_ROUND));
     await userModel.updateOne({ email }, { password: hashedPassword, sendCode: null });
      return res.status(200).json({ message: "Password reset successful" });

    return res.json(user);

}
