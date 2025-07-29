import abi from '@/lib/abi.json'

export const IS_STAGING_ENVIROMENT = true;
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
export const CONTRACT_ABI = abi;
export const DB_NAME = process.env.DB_NAME!;
export const MONGODB_URI = process.env.MONGODB_URI!;
export const LOCALDB_URI = process.env.LOCALDB_URI!;