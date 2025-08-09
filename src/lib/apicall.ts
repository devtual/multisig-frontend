import { API_ENDPOINT } from "@/config";
import { sleep } from "@/helpers/common";
import { IApiResponse } from "@/types";

type HttpMethod = "POST" | "GET";

export class ApiCall {
    static instance: ApiCall;

    private constructor(){}

    static getInstance(){
        if(!ApiCall.instance){
            ApiCall.instance = new ApiCall();
        }

        return ApiCall.instance;
    }

    public async post(endpoint: string, body: object, shoudlEncrypt: boolean = false, method:HttpMethod = "POST") {
            return await this._post(endpoint, body, method, shoudlEncrypt, false);
    }

    public async postAuth(endPoint: string, body: object, shouldEncrypt = false, method:HttpMethod = "POST") {
        return this._post(endPoint, body, method, shouldEncrypt, true)
    }

    private async _post(endpoint: string, body: object, method:HttpMethod = "POST", shouldEncrypt = false, isAuth = false){
        try {
            

            const url = API_ENDPOINT + endpoint;

            var headers:any = {
                'Content-Type': 'application/json',
            };
            if(isAuth) {
                // headers['x-token'] = this.user.getToken();
            }

            const httpResp:any = await fetch(url, {
                method,
                headers: headers,
                body: JSON.stringify(body),
            });
            
            if(httpResp.status === 404){
                return this.responseMaker({message: 'url not found on server'}, false);
            }

            const response = await (httpResp).json();

            if (httpResp.status >= 400 && httpResp.status < 600) {
                if (httpResp.status === 401) { 
                    return this.responseMaker(response, false);
                } 

                if (!response.status) {
                    return this.responseMaker(response, false);

                }
                
                return this.responseMaker(response, false);
            } 
                
            return this.responseMaker(response, true);
            
        } catch(err){
            const error = {message: ''};
            
            if(err instanceof Error){
                error.message = err.message
            } else {
                error.message = JSON.stringify(err)
            }

            return this.responseMaker(error, false);
        }
    }

    public async get(endpoint: string, body: object, shoudlEncrypt: boolean = false) {
        return await this._get(endpoint, body, shoudlEncrypt, false);
    }

    public async getAuth(endpoint: string, body: object, shoudlEncrypt: boolean = false) {
        return await this._get(endpoint, body, shoudlEncrypt, true);
    }

    private async _get(endpoint: string, body: object, shoudlEncrypt: boolean, isAuthenticated: boolean, retry: boolean = true): Promise<any> {
        try {
       
            const url = API_ENDPOINT + endpoint + this.objectToQueryParam(body);

            var headers: any = {
                'Content-Type': 'application/json'
            };

            if (isAuthenticated) {
                // headers['x-auth'] = this.user.getToken();
            }
        
            const httpResp = await fetch(url, {
                method: 'GET',
                headers: headers
            })

            if(httpResp.status === 404){
                return this.responseMaker({message: 'url not found on server'}, false);
            }

            if(httpResp.status === 204){
                return this.responseMaker({message: ''}, false);
            }

            const response = await (httpResp).json();
            
            if (httpResp.status >= 400 && httpResp.status < 600) {
                if (httpResp.status === 401) {
                    return;
                } else if (!response.status) {
                    return this.responseMaker(response, false);
                }

                return this.responseMaker(response, false);
            }
            if (response.status === false && response.message === "IR" && isAuthenticated && retry) {
                await sleep(1000);
                return await this._get(endpoint, body, shoudlEncrypt, isAuthenticated);
            } else {
                return this.responseMaker(response, true);
            }
        } catch (err) {
            const error = {message: ''};
            
            if(err instanceof Error){
                error.message = err.message
            } else {
                error.message = JSON.stringify(err)
            }

            return this.responseMaker(error, false);
        }
    }
    

    public responseMaker(response:any, success: boolean) : IApiResponse {
        return {
            status: success,
            message: success ? response.message : 'success',
            result: success ? response.data : null,
        }
    }

    private objectToQueryParam(obj: Record<string, any>): string {
        if (!obj || typeof obj !== 'object') {
            return '';
        }
    
        try {
            const queryString = Object.entries(obj)
                .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
                .join('&');
    
            return queryString ? `?${queryString}` : '';
        } catch (error) {
            console.error('Error converting object to query parameters:', error);
            return '';
        }
    }

    private formatQueryParams(params: Record<string, any>): string {
        if (!params || typeof params !== 'object') {
            return '';
        }
    
        return Object.keys(params)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
            .join('&');
    }
}