import { sendExecutionEmail } from '@/backend/lib/email';
import { NextApiRequest, NextApiResponse } from 'next';

export async function POST(req:NextApiRequest, res:NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { owner, txDetail } = req.body;
    await sendExecutionEmail(owner, txDetail);
    res.status(200).json({ success: true });
  } catch (error:any) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
}