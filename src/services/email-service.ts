import { ApiCall } from "@/lib/apicall";
import { IApiResponse } from "@/types";

export class EmailService {
  private static instance: EmailService;
  private apiCall: ApiCall;

  protected constructor() {
    this.apiCall = ApiCall.getInstance();
  }

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async confirm(owner:string, txDetail: {
      txIndex: number;
      value: string;
      title: string;
    
  }): Promise<IApiResponse> {
      return await this.apiCall.post('api/email/confirm', { owner, txDetail });
  }

  async execute(owner:string, txDetail: {
      txIndex: number;
      value: string;
      title: string;
  }): Promise<IApiResponse> {
      return await this.apiCall.post('api/email/execute', { owner, txDetail });
  }
}

export default EmailService.getInstance();