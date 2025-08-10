import { APP_EMAIL_FROM, APP_NAME, SMTP_HOST, SMTP_PASSWORD, SMTP_PORT, SMTP_SECURE, SMTP_USER } from "@/config";
import nodemailer from "nodemailer";
import dotenv from 'dotenv';

dotenv.config();

const owners:any = {
  john: {
    name: process.env.OWNER_JOHN_NAME,
    email: process.env.OWNER_JOHN_EMAIL
  },
  jack: {
    name: process.env.OWNER_JACK_NAME,
    email: process.env.OWNER_JACK_EMAIL
  }
};

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

export async function sendConfirmationEmail(confirmingOwner:string, tx:any) {
  if (!owners[confirmingOwner]) {
    throw new Error(`Invalid owner: ${confirmingOwner}`);
  }

  const otherOwner = confirmingOwner === 'john' ? owners.jack : owners.john;
  
  const mailOptions = {
    from: `"${APP_NAME}" <${APP_EMAIL_FROM}>`,
    to: otherOwner.email,
    subject: `Transaction Confirmed by ${owners[confirmingOwner].name}`,
    text: `Hello ${otherOwner.name},\n\n` +
          `${owners[confirmingOwner].name} has confirmed the following transaction:\n\n` +
          `Transaction ID: ${tx.txIndex}\n` +
          `Amount: ${tx.value}\n` +
          `Description: ${tx.title}\n\n` +
          `Please review when you get a chance.\n\n` +
          `Best regards,\n`,
    html: `<p>Hello ${otherOwner.name},</p>
          <p>${owners[confirmingOwner].name} has confirmed the following transaction:</p>
          <ul>
            <li><strong>Transaction ID:</strong> ${tx.txIndex}</li>
            <li><strong>Amount:</strong> ${tx.value}</li>
            <li><strong>Description:</strong> ${tx.title}</li>
          </ul>
          <p>Please review when you get a chance.</p>
          <p>Best regards,<br>${APP_NAME}</p>`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    if (process.env.EMAIL_LOGGING === 'true') {
      console.log('Confirmation email sent:', info.messageId);
    }
    return true;
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    throw error;
  }
}

export async function sendExecutionEmail(executingOwner:string, tx:any) {
  if (!owners[executingOwner]) {
    throw new Error(`Invalid owner: ${executingOwner}`);
  }

  const mailOptions = {
    from: `"${APP_NAME}" <${APP_EMAIL_FROM}>`,
    to: `${owners.john.email}, ${owners.jack.email}`,
    // replyTo: process.env.APP_EMAIL_REPLY_TO,
    subject: `Transaction Executed by ${owners[executingOwner].name}`,
    text: `Hello Owners,\n\n` +
          `${owners[executingOwner].name} has executed the following transaction:\n\n` +
          `Transaction ID: ${tx.txIndex}\n` +
          `Amount: ${tx.value}\n` +
          `Description: ${tx.title}\n\n` +
          `This transaction is now complete.\n\n` +
          `Best regards,\n` +
          APP_NAME,
    html: `<p>Hello Owners,</p>
          <p>${owners[executingOwner].name} has executed the following transaction:</p>
          <ul>
            <li><strong>Transaction ID:</strong> ${tx.txIndex}</li>
            <li><strong>Amount:</strong> ${tx.value}</li>
            <li><strong>Description:</strong> ${tx.title}</li>
          </ul>
          <p>This transaction is now complete.</p>
          <p>Best regards,<br>${APP_NAME}</p>`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    // if (process.env.EMAIL_LOGGING === 'true') {
    //   console.log('Execution email sent:', info.messageId);
    // }
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
          
          <div style="background-color: #4CAF50; color: white; padding: 16px; text-align: center;">
            <h1 style="margin: 0; font-size: 20px;">${APP_NAME} - Owner Request</h1>
          </div>
          
          <div style="padding: 24px; font-size: 15px; color: #333;">
            <p>Hi,</p>
            <p><strong>${name}</strong> (<a href="mailto:${email}" style="color: #4CAF50; text-decoration: none;">${email}</a>) has submitted a request to be added as an owner.</p>
            <p>Please review and approve the request.</p>
            
            <div style="margin-top: 24px; text-align: center;">
              <a href="${process.env.APP_REVIEW_URL}" 
                 style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; font-size: 15px; border-radius: 5px; text-decoration: none;">
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

// Example usage with error handling
export async function testEmailFunctions() {
  const transactionExample = {
    id: 'TX123456',
    amount: '$1,000.00',
    description: 'Vendor payment for services'
  };

  try {
    // Test confirmation email
    await sendConfirmationEmail('john', transactionExample);
    
    // Test execution email
    await sendExecutionEmail('jack', transactionExample);
    
    console.log('All email tests completed successfully');
  } catch (error) {
    console.error('Email test failed:', error);
  }
}
