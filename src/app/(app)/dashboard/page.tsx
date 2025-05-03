'use client'
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Message, User } from "@/models/User.model";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { acceptMessageSchema } from "@/schemas/acceptMessageSchema";
import dbConnect from "@/lib/dbConnect";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { useSession } from "next-auth/react";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCcw } from "lucide-react";
import MessageCard from "@/components/MessageCard";


const page = () => {
    const [profileUrl, setProfileUrl] = useState('')
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isSwitchLoading, setIsSwitchLoading] = useState(false)

    const {data:session} = useSession()
    const handleDeleteMessage = (messageId : string) => {
        setMessages(messages.filter((message) => message._id !== messageId))
    }

    const form = useForm({
        resolver: zodResolver(acceptMessageSchema)
    })
    const {register, watch, setValue} = form
    const acceptMessages = watch('acceptMessages')

    const fetchAcceptMessage = useCallback(async() => {
        setIsSwitchLoading(true)
        try {
            const response = await axios.get<ApiResponse>('/api/accept-messages')
            setValue('acceptMessages', response.data.isAcceptingMessages ?? false)
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            toast.error('failed to fetch message setting')
        } finally{
            setIsSwitchLoading(false)
        }
    }, [setValue])

    const fetchMessages = useCallback(async(refresh: boolean = false)=> {
        setIsLoading(true)
        setIsSwitchLoading(false)
        try {
            const response = await axios.get('/api/get-message')
            
            setMessages(response.data.messages || [])
            if(refresh){
                toast.success("refresh messages")
            }
        } catch (error) {
            toast.error('failed to  get message')
        } finally{
            setIsLoading(false)
            setIsSwitchLoading(false)
        }
    }, [setIsLoading, setMessages])

    useEffect(() => {
        if(!session || !session.user) return
        fetchMessages()
        fetchAcceptMessage()
    }, [session, setValue, fetchAcceptMessage, fetchMessages])

    const handlleSwitchChange = async() => {
        try {
            const response = await axios.post<ApiResponse>(`/api/accept-messages`, {
                acceptMessages: !acceptMessages
            })
            setValue('acceptMessages', !acceptMessages)
            toast(response.data.message)
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            toast.error(axiosError.response?.data.message || "failed to fetch message setting")
            
        }
    }
    const {username} = session?.user as User || ''
    // TODO: do more research
    // const baseUrl = `${window.location.protocol}//${window.location.host}`
    // const profileUrl = `${baseUrl}/u/${username}`
    
    useEffect( () => {
        const baseUrl = `${window.location.protocol}//${window.location.host}`
        const profileUrl = `${baseUrl}/u/${username}`
        setProfileUrl(profileUrl)

    }, [])
    
     const copyToClipboard = () => {
        navigator.clipboard.writeText(profileUrl)
        toast.success("profile Url has been copied")
    }
     if(!session || !session.user){
        return <div>Please login</div>
    }
    
    return(
            <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
                <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>
                <div className="mb-4">
                    <h2 className="text-lg font-semibold mb-2">copy your Unique link</h2>{' '}
                    <div className="flex items-center">
                        <input type="text"  value={profileUrl} className="input input-bordered w-full p-2 mr-2" onChange={(e) => setProfileUrl(e.target.value)}/>
                        <Button onClick={copyToClipboard}>copy</Button>
                    </div>
                </div>
                <div className="mb-4">
                    <Switch
                        {...register('acceptMessages')}
                        checked={acceptMessages}
                        onCheckedChange={handlleSwitchChange}
                        disabled = {isSwitchLoading}
                    />
                    <span className="ml-2">
                        Accept Message: {acceptMessages ? 'On' : 'Off'}
                    </span>
    
                </div>
                <Separator/>
                <Button className="mt-4" variant='outline' onClick={(e) => {
                    e.preventDefault();
                    fetchMessages(true);
                }}>
                    {isLoading ? (<Loader2 className="h-4 w-4 animate-spin"/>) : (<RefreshCcw className="h-4 w-4"/>)} 
                    </Button>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {messages.length > 0 ? (
                            messages.map((messages) => (
                                <MessageCard 
                                    // key={messages._id}
                                    
                                    message={messages}
                                    onMessageDelete={handleDeleteMessage}
                                />
    
                            ))
                        ) : (
                            <p>no message to display</p>
                        )}
                    </div>
            </div>
        )
}

export default page