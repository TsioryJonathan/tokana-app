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
    public async getApiSlotsStandard(
        zoneLevel: 'ville' | 'peripherie' | 'super-peripherie',
    ): Promise<Array<Slot>> {
        const res: any = await this.httpRequest.request({
            method: 'GET',
            url: '/api/slots',
            query: {
                'type': 'standard',
                'zoneLevel': zoneLevel,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
        return Array.isArray(res?.slots) ? res.slots : [];
    }
    /**
     * Get express availability
     * @returns any OK
     * @throws ApiError
     */
    public getApiSlotsExpress(): CancelablePromise<{
        allowed?: boolean;
        eta?: { minMinutes?: number; maxMinutes?: number };
        reason?: string | null;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/slots',
            query: {
                'type': 'express',
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }
}
