import { sendVerificationEmail } from "@/helpers/sendVerificationEmail"
import dbConnect from "@/lib/dbConnect"
import UserModel from "@/models/User.model"
import bcrypt from "bcryptjs"

export async function POST(request: Request){
    await dbConnect()
    try {
        const {username,email, password } = await request.json()
        const existingUserVerifiedByUsername = await UserModel.findOne({
            username,
            isVerified: true
        })
        if(existingUserVerifiedByUsername){
            return Response.json({
                success: false,
                message: "username is already taken"
            },{
                status: 400
            })
        }
        const existingUserByEmail = await UserModel.findOne({email})
        const verifyCode = Math.floor(100000 + Math.random()*900000).toString()
        if(existingUserByEmail){
           if(existingUserByEmail.isVerified){
            return Response.json({
                success:false,
                message: "user already exist with email"
            }, {
                status:500
            })
           }else{
            const hashedPassword = await bcrypt.hash(password,10)
            existingUserByEmail.password = hashedPassword;
            existingUserByEmail.verifyCode = verifyCode;
            existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000)
            await existingUserByEmail.save()
           } 
        }else{
            const hashedPassword = await bcrypt.hash(password,10)
            const expiryDate = new Date()
            expiryDate.setHours(expiryDate.getHours() + 1);
            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry:expiryDate,
                isLoggedIn:false,
                isVerified:false,
                isAcceptingMessage: true,
                message: []
            })
            await newUser.save()

        }

        // send verification email 
        const emailResponse = await sendVerificationEmail(username, email, password)   
        if(!emailResponse.success){
            return Response.json({
                success: false,
                message: emailResponse.message
            },{
                status: 500
            })
        }
        return Response.json({
            success: true,
            message: "user registered successfully"
        }, {
            status: 201
        })
    } catch (error) {
        console.error("error while registering")
        return Response.json({
            success: false,
            message: "error registering user"
        }, {
            status: 500
        })
        
    }


}