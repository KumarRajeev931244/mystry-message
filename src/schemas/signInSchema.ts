import { z } from "zod";

export const signInSchema = z.object({
    identifiter: z.string(),
    password: z.string()
})