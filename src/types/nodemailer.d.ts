declare module 'nodemailer' {
    import { Transporter } from 'nodemailer';
  
    interface SendMailOptions {
      from?: string;
      to: string;
      subject: string;
      text?: string;
      html?: string;
    }
  
    interface SentMessageInfo {
      accepted: string[];
      rejected: string[];
      response: string;
    }
  
    export function createTransport(options: any): Transporter;
  
    export interface Transporter {
      sendMail(mailOptions: SendMailOptions, callback?: (err: Error | null, info: SentMessageInfo) => void): Promise<SentMessageInfo>;
    }
  
    export default {
      createTransport: (options: any) => Transporter
    };
}
