/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OTPRequest } from '../models/OTPRequest';
import type { OTPVerify } from '../models/OTPVerify';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class DeliveryOtpService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Request delivery OTP
     * @param id
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public postApiOrdersRequestOtp(
        id: number,
        requestBody: OTPRequest,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/orders/{id}/request-otp',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                404: `Not Found`,
                409: `Conflict (already verified)`,
                429: `Too Many Requests (cooldown)`,
            },
        });
    }
    /**
     * Verify delivery OTP
     * @param id
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public postApiOrdersVerifyOtp(
        id: number,
        requestBody: OTPVerify,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/orders/{id}/verify-otp',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                404: `Not Found`,
                409: `Conflict (invalid or expired code / already verified)`,
            },
        });
    }
}
