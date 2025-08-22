/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class AdminUsersService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Create delivery user (livreur)
     * @param requestBody
     * @returns any Created
     * @throws ApiError
     */
    public postApiAdminUsers(
        requestBody: {
            email?: string;
            /**
             * MG format: +26120xxxxxxx or 020xxxxxxx
             */
            phone: string;
            password: string;
            name: string;
        },
    ): CancelablePromise<{
        id?: number;
        email?: string | null;
        phone?: string;
        name?: string;
        role?: 'client' | 'livreur' | 'admin';
    }> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/admin/users',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Validation error`,
                401: `Unauthorized`,
                403: `Forbidden (admin only)`,
                409: `Conflict (email/phone already exists)`,
            },
        });
    }
}
