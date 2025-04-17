import { z } from "zod";

export const isLoggedInSchema = z.object({
    isLoggedIn: z.boolean()
})