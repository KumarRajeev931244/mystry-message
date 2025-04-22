'use client'
import React from "react"
import axios, { AxiosError } from "axios"
import { Message } from "@/models/User.model"
import { acceptMessageSchema } from "@/schemas/acceptMessageSchema"
import { zodResolver } from "@hookform/resolvers/zod"
import { useSession } from "next-auth/react"
import { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { ApiResponse } from "@/types/ApiResponse"
import { toast } from "sonner"
import { User } from "next-auth"
import { Button } from "@/components/ui/button"
import { Switch } from "@radix-ui/react-switch"
import { Separator } from "@/components/ui/separator"
import { Loader2, RefreshCcw } from "lucide-react"
import MessageCard from "@/components/MessageCard"


const page = () => {
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isSwitchLoading, setIsSwitchLoading] = useState(false)

    
    const handleDeleteMessage = (messageId: string) => {
        setMessages(messages.filter((message) => message._id !== messageId))
    }
    const {data: session} = useSession()
    const form = useForm({
        resolver: zodResolver(acceptMessageSchema)
    })


    //we extract the register, watch and setValue from the form object
    const {register, watch, setValue}  = form;
    const acceptMessage = watch('acceptMessage')

    const fetchAcceptMessage = useCallback(async() => {
        setIsSwitchLoading(true)
        try {
            const response = await axios.get(`/api/accept-messages`)
            setValue('acceptMessage', response.data.isAcceptingMessage)
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            toast.error(axiosError.response?.data.message || "failed to fetch message setting")
            
        }finally{
            setIsSwitchLoading(false)
        }

    },[setValue])

    const fetchMessages = useCallback(async(refresh: boolean = false) => {
        setIsLoading(true)
        setIsSwitchLoading(false)
        try {
            const response = await axios.get<ApiResponse>('/api/get-message')
            setMessages(response.data.messages || [])
            if(refresh){
                toast.success("showing latest messages")
            }
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            toast.error(axiosError.response?.data.message || "failed to fetch message setting")
            
        }finally{
            setIsSwitchLoading(false)
            setIsLoading(false)
        }                 
    },[setIsLoading, setMessages])

    useEffect(() => {
        if(!session || !session.user) return
        fetchMessages()
        fetchAcceptMessage()
    }, [session, setValue, fetchAcceptMessage, fetchMessages])

    // handle switch change
    const handlleSwitchChange = async() => {
        try {
            const response =  await axios.post<ApiResponse>(`/api/accept-messages`, {acceptMessage: !acceptMessage}
            )
            setValue('acceptMessage', !acceptMessage)
            toast.success(response.data.message)
            
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            toast.error("failed to fetch message setting") 
            
        }           
    }

    const {username} = session?.user as User
    // TODO: do more research
    const baseUrl = `${window.location.protocol}//${window.location.host}`
    const profileUrl = `${baseUrl}/u/${username}`
    
    
    
    
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
                    <input type="text" value={profileUrl} className="input input-bordered w-full p-2 mr-2" />
                    <Button onClick={copyToClipboard}>copy</Button>
                </div>
            </div>
            <div className="mb-4">
                <Switch
                    {...register('acceptMessage')}
                    checked={acceptMessage}
                    onCheckedChange={handlleSwitchChange}
                    disabled = {isSwitchLoading}
                />
                <span className="ml-2">
                    Accept Message: {acceptMessage ? 'On' : 'Off'}
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
                                key={messages._id}
                                
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

