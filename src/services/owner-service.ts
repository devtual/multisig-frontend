import { ApiCall } from "@/lib/apicall";
import { IApiResponse, IOwner } from "@/types";

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

    public async updateOwnerStatus(id: string, status: string): Promise<IApiResponse> {
        return await this.apiCall.post(`api/owners/${id}`, { status }, false, "PATCH");
    }

    public async getOwnerByAddress(address: string): Promise<IApiResponse> {
        return await this.apiCall.get(`api/owners/${address}`, {});
    }

    public async mergeOwners(onChainOwners: string[], dbOwners: any[]) {
        const chainAddresses = new Set(
            onChainOwners.map(addr => addr.toLowerCase())
        );

        return dbOwners.map(dbOwner => {
            const normalizedDbAddress = dbOwner.address.toLowerCase();
            const isOnChain = chainAddresses.has(normalizedDbAddress);

            return {
                ...dbOwner,
                _id: dbOwner._id.toString(),
                status: isOnChain ? 'approved' : dbOwner.status || 'pending',
                updatedAt: new Date(dbOwner.updatedAt).toISOString()
            };
        });
    }

    public async getOnChainOwners(onChainAddresses: string[], dbOwners: any[], limit?: number){
        const chainAddresses = new Set(
            onChainAddresses.map(addr => addr.toLowerCase())
        );

        const owners = dbOwners.filter(dbOwner => chainAddresses.has(dbOwner.address.toLowerCase()));
        return limit ? owners.slice(0, limit) : owners;
    }

}

export default OwnerService.getInstance();
