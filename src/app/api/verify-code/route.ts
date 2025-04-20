import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User.model";

export async function POST(request: Request){
    await dbConnect()
    try {
        const {username,code} = await request.json()
        const decodedUsername = decodeURIComponent(username)
        const user = await UserModel.findOne({username: decodedUsername})
        if(!user){
            return Response.json({
                success: false,
                message: "user not found"
            },{
                status:400
            })
        }
        const isCodeValid = user.verifyCode === code

        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date()

        if(isCodeValid && isCodeNotExpired){
            user.isVerified = true,
            user.isLoggedIn = true
            await user.save()
            return Response.json({
                success: true,
                message: "account created successfully"
            },{
                status: 200
            })
        }else if(!isCodeNotExpired){
            return Response.json({
                success: false,
                message: "code expire please login again"
            },{
                status: 400
            })

        }else{
            return Response.json({
                success: false,
                message: "incorrect otp"
            },{
                status: 200
            })
        }


        
    } catch (error) {
        console.log("error while checking verify code:", error)
        return Response.json({
            success:false,
            message: "error while checking verify code"
        },{
            status:500
        })
        
    }
        
    
}