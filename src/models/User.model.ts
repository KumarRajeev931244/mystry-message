import mongoose, {Schema, Document} from "mongoose";
import { boolean } from "zod";

export interface Message extends Document{
    _id: string,
    content: string,
    createdAt: Date
}

const MessageSchema:Schema<Message> = new Schema({
    content:{
        type: String,
        required: true
    },
    createdAt:{
        type: Date,
        required: true,
        default: Date.now

    }
})

export interface User extends Document{
    username:string,
    email:string,
    password:string,
    verifyCode:string,
    verifyCodeExpiry:Date,
    isLoggedIn:boolean,
    isVerified:boolean,
    isAcceptingMessage:boolean,
    message: Message[]

}

const UserSchema: Schema<User> = new Schema({
    username:{
        type:String,
        required:[true, "username is required"],
        unique:true,
        trim: true
    },
    email:{
        type:String,
        required:[true, "email is required"],
        unique: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/ , 'please use a valid email address']
    },
    password:{
        type:String,
        required:[true, "password is required"],
        unique: true,
    },
    verifyCode:{
        type:String,
        required:[true, "verify code is required"] 
    },
    verifyCodeExpiry:{
        type:Date,
        required:[true, "verify code  expiry is required"],
    },
    isLoggedIn:{
        type: Boolean,
        default: false
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    isAcceptingMessage:{
        type: Boolean,
        default: false
    },
    message: [MessageSchema]
})

const UserModel = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>("User",UserSchema)

export default UserModel