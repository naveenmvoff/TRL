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

    // New interface for transport options
    interface TransportOptions {
      host?: string;
      port?: number;
      secure?: boolean;
      auth?: {
        user: string;
        pass: string;
      };
      service?: string;
    }
  
    export function createTransport(options: TransportOptions): Transporter;
  
    export interface Transporter {
      sendMail(mailOptions: SendMailOptions, callback?: (err: Error | null, info: SentMessageInfo) => void): Promise<SentMessageInfo>;
    }
  
    // const nodemailer = {
    //   createTransport: ((TransportOptions) => Transporter)
    // };
  
    export default nodemailer;
}
