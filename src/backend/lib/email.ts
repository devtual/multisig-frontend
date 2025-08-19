import { APP_EMAIL_FROM, APP_NAME, BASE_URL, SMTP_HOST, SMTP_PASSWORD, SMTP_PORT, SMTP_SECURE, SMTP_USER } from "@/config";
import nodemailer from "nodemailer";
import dotenv from 'dotenv';
import { IOwner } from "../models/Owner";
import { ITransaction } from "@/types";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: parseInt(SMTP_PORT),
  secure: SMTP_SECURE === 'true',
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD
  },
  tls: {
    rejectUnauthorized: process.env.NODE_ENV !== 'production'
  }
});

export async function sendConfirmationEmail(confirmingOwner: Partial<IOwner>, owner: Partial<IOwner>,  tx: any) {
  const mailOptions = {
    from: `"${APP_NAME}" <${APP_EMAIL_FROM}>`,
    to: owner.email,
    subject: `Transaction Confirmed by ${confirmingOwner.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 30px;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background-color: #9234ea; color: white; padding: 16px; text-align: center;">
            <h1 style="margin: 0; font-size: 20px;">${APP_NAME} - Transaction Confirmation</h1>
          </div>
          
          <!-- Body -->
          <div style="padding: 24px; font-size: 15px; color: #333;">
            <p>Hello ${owner.name},</p>
            <p><strong>${confirmingOwner.name}</strong> has confirmed the following transaction:</p>
            
            <ul style="padding-left: 20px; line-height: 1.6;">
              <li><strong>Transaction ID:</strong> ${tx.txIndex}</li>
              <li><strong>Amount:</strong> ${tx.value}</li>
              <li><strong>Description:</strong> ${tx.title}</li>
            </ul>

            <p>Please review when you get a chance.</p>
            
            <div style="margin-top: 24px; text-align: center;">
              <a href={${BASE_URL}transactions}
                 style="display: inline-block; background-color: #9234ea; color: white; padding: 12px 24px; font-size: 15px; border-radius: 5px; text-decoration: none;">
                View Transaction
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f4f6f8; padding: 16px; text-align: center; font-size: 12px; color: #999;">
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
          </div>
          
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);

    return true;
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    throw error;
  }
}


export async function sendExecutionEmail(executingOwner: Partial<IOwner>, owner: Partial<IOwner>,  tx: ITransaction) {
  const mailOptions = {
    from: `"${APP_NAME}" <${APP_EMAIL_FROM}>`,
    to: `${owner.email}`,
    subject: `Transaction Executed by ${executingOwner.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 30px;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background-color: #9234ea; color: white; padding: 16px; text-align: center;">
            <h1 style="margin: 0; font-size: 20px;">${APP_NAME} - Transaction Executed</h1>
          </div>
          
          <!-- Body -->
          <div style="padding: 24px; font-size: 15px; color: #333;">
            <p>Hello Owners,</p>
            <p><strong>${executingOwner.name}</strong> has executed the following transaction:</p>
            
            <ul style="padding-left: 20px; line-height: 1.6;">
              <li><strong>Transaction ID:</strong> ${tx.txIndex}</li>
              <li><strong>Amount:</strong> ${tx.value}</li>
              <li><strong>Description:</strong> ${tx.title}</li>
            </ul>

            <p>This transaction is now complete.</p>
            
            <div style="margin-top: 24px; text-align: center;">
              <a href={${BASE_URL}transactions} 
                 style="display: inline-block; background-color: #9234ea; color: white; padding: 12px 24px; font-size: 15px; border-radius: 5px; text-decoration: none;">
                View Transaction
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f4f6f8; padding: 16px; text-align: center; font-size: 12px; color: #999;">
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
          </div>
          
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending execution email:', error);
    throw error;
  }
}

export async function sendOwnerReqEmail(name: string, email: string) {
  const mailOptions = {
    from: `"${APP_NAME}" <${APP_EMAIL_FROM}>`,
    to: process.env.DEPLOYER_EMAIL,
    subject: `Add Owner Request from ${name}`,
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 30px;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          
          <div style="color: #9234ea; padding: 16px; font-size: 20px; font-weight: 600">
            <img src="https://wallet.devtual.com/logo.png" alt="Tresis Logo"  style="margin-right:10px" /> Tresis
          </div>
          
          <div style="padding: 24px; padding-top: 0px; font-size: 15px; color: #333;">
            <p>Hi,</p>
            <p><strong>${name}</strong> (<a href="mailto:${email}" style="color: #9234ea; text-decoration: none;">${email}</a>) has submitted a request to be added as an owner.</p>
            <p>Please review and approve the request.</p>
            
            <div style="margin-top: 24px; text-align: center;">
              <a href={${BASE_URL}owners} 
                 style="display: inline-block; background-color: #9234ea; color: white; padding: 8px 16px; font-size: 14px; border-radius: 5px; text-decoration: none;">
                Review Request
              </a>
            </div>
          </div>
          
          <div style="background-color: #f4f6f8; padding: 16px; text-align: center; font-size: 12px; color: #999;">
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
          </div>
          
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    
    return true;
  } catch (error) {
    console.error('Error sending add owner request email:', error);
    throw error;
  }
}
