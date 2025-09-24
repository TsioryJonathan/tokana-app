/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Slot } from '../models/Slot';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class SlotsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Get standard delivery slots
     * @param zoneLevel
     * @returns Slot OK
     * @throws ApiError
     */
    public getApiSlotsStandard(
        zoneLevel: 'ville' | 'peripherie' | 'super-peripherie',
    ): CancelablePromise<Array<Slot>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/slots/standard',
            query: {
                'zoneLevel': zoneLevel,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Get express availability
     * @returns any OK
     * @throws ApiError
     */
    public getApiSlotsExpress(): CancelablePromise<{
        allowed?: boolean;
        reason?: string | null;
        eta?: {
            minMinutes?: number;
            maxMinutes?: number;
        };
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/slots/express',
            errors: {
                401: `Unauthorized`,
            },
        });
    }
}
