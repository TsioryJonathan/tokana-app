/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserAddress } from '../models/UserAddress';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class AddressesService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * List current user's saved addresses
     * @returns UserAddress OK
     * @throws ApiError
     */
    public getApiAddresses(): CancelablePromise<Array<UserAddress>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/addresses',
            errors: {
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Create a new address for current user
     * @param requestBody
     * @returns UserAddress Created
     * @throws ApiError
     */
    public postApiAddresses(
        requestBody: {
            label?: string | null;
            detail: string;
            lat?: number | null;
            lng?: number | null;
            isDefault?: boolean | null;
        },
    ): CancelablePromise<UserAddress> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/addresses',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request (validation error)`,
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Update an address
     * @param id
     * @param requestBody
     * @returns UserAddress OK
     * @throws ApiError
     */
    public putApiAddresses(
        id: number,
        requestBody: {
            label?: string | null;
            detail: string;
            lat?: number | null;
            lng?: number | null;
            isDefault?: boolean | null;
        },
    ): CancelablePromise<UserAddress> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/api/addresses/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request (validation error)`,
                401: `Unauthorized`,
                404: `Not Found (address not owned by user or not exists)`,
            },
        });
    }
    /**
     * Delete an address
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public deleteApiAddresses(
        id: number,
    ): CancelablePromise<{
        msg?: string;
    }> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/addresses/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                404: `Not Found (address not owned by user or not exists)`,
            },
        });
    }
}
