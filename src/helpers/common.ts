export function dateFormat(unixTimestamp: number): string {
  const date = new Date(Number(unixTimestamp) * 1000); 

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export function sleep(ms:number){
  return new Promise(resolve => setTimeout(resolve, ms))
}