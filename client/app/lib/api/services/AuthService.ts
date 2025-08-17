/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuthTokens } from '../models/AuthTokens';
import type { LoginRequest } from '../models/LoginRequest';
import type { User } from '../models/User';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class AuthService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Register with email or phone
     * @param requestBody
     * @returns any Created
     * @throws ApiError
     */
    public postApiAuthRegister(
        requestBody: {
            email?: string;
            phone?: string;
            password?: string;
            name?: string | null;
        },
    ): CancelablePromise<{
        user?: User;
        token?: string;
        refreshToken?: string;
    }> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/auth/register',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                409: `Conflict (email or phone already registered)`,
            },
        });
    }
    /**
     * Login with email or phone
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public postApiAuthLogin(
        requestBody: LoginRequest,
    ): CancelablePromise<{
        user?: User;
        token?: string;
        refreshToken?: string;
    }> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/auth/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized (invalid credentials)`,
            },
        });
    }
    /**
     * Refresh access token
     * @param requestBody
     * @returns AuthTokens OK
     * @throws ApiError
     */
    public postApiAuthRefresh(
        requestBody: {
            refreshToken: string;
        },
    ): CancelablePromise<AuthTokens> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/auth/refresh',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized (invalid/expired refresh token)`,
            },
        });
    }
    /**
     * Logout (revoke one refresh token)
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public postApiAuthLogout(
        requestBody: {
            refreshToken: string;
        },
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/auth/logout',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized (invalid refresh token)`,
            },
        });
    }
    /**
     * Logout all sessions
     * @returns any OK
     * @throws ApiError
     */
    public postApiAuthLogoutAll(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/auth/logout-all',
            errors: {
                401: `Unauthorized (missing/invalid token)`,
            },
        });
    }
}
