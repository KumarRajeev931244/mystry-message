import { z } from "zod";

export const MessageSchema = z.object({
    content: z
        .string()
        .min(10, {message:"message should be atleast 10 character"})
        .max(200, {message:"message should not more than 300 character"})
})