import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User.model";
import { Message } from "@/models/User.model";

export async function POST(request: Request){
    await dbConnect()

    const {username, content} = await request.json()
    try {
        const user = await UserModel.findOne({username})
        if(!user){
            return Response.json({
                success: false,
                message: "user not found while sending messages"
            },{
                status: 404
            })
        }
        if(!user.isAcceptingMessage){
            return Response.json({
                success: false,
                message: "user is not accepting messages"
            },{
                status: 403
            })
        }

        const newMessage = {content, createdAt: new Date()}
        user.message.push(newMessage as Message)
        await user.save()
        return Response.json({
            success: true,
            message: "message send successfully" 
        },{
            status: 200
        })


    } catch (error) {
        console.error("error while sending messages")
        return Response.json({
            success: false,
            message: "failed to send messages"
        },{
            status: 500
        })
        
    }
}