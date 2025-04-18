import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/verificationEmailTemplate";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
    emails: string,
    username: string,
    verifyCode: string
): Promise<ApiResponse>{
    try {
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: emails,
            subject: 'Mystry Message | verification code',
            react: VerificationEmail({username, otp:verifyCode})
        });
        return {success:true, message: "verification email send successfully"}               
    } catch (error) {
        console.error("error sending verification email",error)
        return {success: false, message: "failed  to send verification email"}
    }
}