import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendPasswordResetEmail = async (to: string, resetLink: string): Promise<void> => {
  await resend.emails.send({
    from: process.env.EMAIL_FROM as string,
    to,
    subject: 'Reset your TheGarbaThrills password',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Reset your password</h2>
        <p>We received a request to reset your TheGarbaThrills password. This link expires in 1 hour.</p>
        <p><a href="${resetLink}" style="display:inline-block;padding:10px 20px;background:#e64980;color:#fff;text-decoration:none;border-radius:6px;">Reset Password</a></p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
};
