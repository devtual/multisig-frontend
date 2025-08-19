import abi from '@/lib/abi.json'

export const APP_NAME = "Tresis";
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;
export const IS_STAGING_ENVIROMENT = false;
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
export const CONTRACT_ABI = abi;
export const DB_NAME = process.env.DB_NAME!;
export const MONGODB_URI = process.env.MONGODB_URI!;
export const LOCALDB_URI = process.env.LOCALDB_URI!;

export const API_ENDPOINT = IS_STAGING_ENVIROMENT ? process.env.NEXT_PUBLIC_STAGE_API! : process.env.NEXT_PUBLIC_API!;
export const SMTP_HOST = process.env.SMTP_HOST!;
export const SMTP_PORT = process.env.SMTP_PORT!;
export const SMTP_SECURE = process.env.SMTP_SECURE!;
export const SMTP_USER = process.env.SMTP_USER!;
export const SMTP_PASSWORD = process.env.SMTP_PASSWORD!;

export const APP_EMAIL_FROM = process.env.APP_EMAIL_FROM!