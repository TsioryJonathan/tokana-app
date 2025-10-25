/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { User } from '../models/User';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class MeService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Get current user
     * @returns User OK
     * @throws ApiError
     */
    public getApiMe(): CancelablePromise<User> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/me',
            errors: {
                401: `Unauthorized (missing/invalid token)`,
            },
        });
    }
    /**
     * Update current user basic fields
     * @param requestBody
     * @returns User OK
     * @throws ApiError
     */
    public putApiMe(
        requestBody: {
            name?: string | null;
            email?: string | null;
            /**
             * Madagascar local or +261... formats accepted
             */
            phone?: string | null;
        },
    ): CancelablePromise<User> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/api/me',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request (validation error)`,
                401: `Unauthorized (missing/invalid token)`,
            },
        });
    }
    /**
     * Upload profile avatar
     * @param formData
     * @returns any Created
     * @throws ApiError
     */
    public postApiMeAvatar(
        formData: {
            avatar?: Blob;
        },
    ): CancelablePromise<{
        avatarUrl?: string;
    }> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/me/avatar',
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                400: `Bad Request (missing file)`,
                401: `Unauthorized (missing/invalid token)`,
            },
        });
    }
}
