import { ApiCall } from "@/lib/apicall";
import { IApiResponse } from "@/types";

export class OwnerService {
    private static instance: OwnerService;
    private apiCall: ApiCall;

    protected constructor() {
        this.apiCall = ApiCall.getInstance();
    }

    public static getInstance(): OwnerService {
        if (!OwnerService.instance) {
            OwnerService.instance = new OwnerService();
        }
        return OwnerService.instance;
    }

    public async addOwner(data: {
        name: string;
        email: string;
        address: string;
    }): Promise<IApiResponse> {
        return await this.apiCall.post("api/owners", data);
    }

    public async getOwners(): Promise<IApiResponse> {
        return await this.apiCall.get("api/owners", {});
    }

    public async getOwnerByAddress(address: string): Promise<IApiResponse> {
        return await this.apiCall.get(`api/owners/${address}`, {});
    }
}

export default OwnerService.getInstance();
