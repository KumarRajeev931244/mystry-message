import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { User } from "next-auth";
import mongoose from "mongoose";
import UserModel from "@/models/User.model";
export async function GET(request:Request){
    await dbConnect()
    const session = await getServerSession(authOptions)
    const user:User = session?.user as User

    if(!session || !session.user){
        return Response.json({
            success: false,
            message: "not authenticated"
        },{
            status: 401
        })
    }
    // during aggreagation pipelines fetching user id directly give some error
    const userId = new mongoose.Types.ObjectId(user._id);
    try {
        const user = await UserModel.aggregate([
            {$match: {id: userId}},
            {$unwind: '$messages'},
            {$sort: {'messages.createdAt': -1}},
            {$group: {_id: '$_id', messages: {$push: '$messages'}}}
        ])
        // TODO: console user
        
        if(!user || user.length === 0){
            return Response.json({
                success: false,
                message: "user not found"
            },{
                status: 401
            })
        }

        return Response.json({
            success: true,
            messages: user[0].messages
        },{
            status: 200
        })
        
    } catch (error) {
        console.log("failed to get messages");
        return Response.json({
            success: false,
            message: "failed to get messages"
        },{
            status: 500
            
        })
        
        
    }
}