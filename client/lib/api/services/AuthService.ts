/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuthTokens } from '../models/AuthTokens';
import type { LoginRequest } from '../models/LoginRequest';
import type { OTPRequest } from '../models/OTPRequest';
import type { OTPVerify } from '../models/OTPVerify';
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
            /**
             * Accepts local 0(3x|20)xxxxxxx or +261..., stored as +261...
             */
            phone?: string;
            password?: string;
            name?: string | null;
        },
    ): CancelablePromise<{
        user?: User;
        token?: string;
        refreshToken?: string;
        /**
         * Present when an OTP has been auto-sent after registration
         */
        otp?: {
            channel?: 'sms' | 'email';
            /**
             * Masked destination
             */
            to?: string | null;
        } | null;
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
    /**
     * Request account OTP (phone/email verification)
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public postApiAuthRequestOtp(
        requestBody: OTPRequest,
    ): CancelablePromise<{
        msg?: string;
        to?: string | null;
        channel?: 'sms' | 'email';
    }> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/auth/request-otp',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request (missing destination or invalid phone/email)`,
                401: `Unauthorized (missing/invalid token)`,
                429: `Too Many Requests (cooldown window in effect)`,
            },
        });
    }
    /**
     * Verify account OTP (mark phone/email as verified)
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public postApiAuthVerifyOtp(
        requestBody: OTPVerify,
    ): CancelablePromise<{
        msg?: string;
        phoneVerifiedAt?: string | null;
        emailVerifiedAt?: string | null;
    }> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/auth/verify-otp',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request (invalid or expired OTP / none active)`,
                401: `Unauthorized (missing/invalid token)`,
                429: `Too Many Requests (temporary lockout due to failed attempts)`,
            },
        });
    }
}
