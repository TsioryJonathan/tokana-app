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
     * @param lat
     * @param lng
     * @returns any OK
     * @throws ApiError
     */
    public getApiSlotsStandard(
        zoneLevel?: 'ville' | 'peripherie' | 'super-peripherie',
        lat?: number,
        lng?: number,
    ): CancelablePromise<{
        type?: 'standard';
        allowed?: boolean;
        zoneLevel?: 'ville' | 'peripherie' | 'super-peripherie';
        inferredZone?: 'ville' | 'peripherie' | 'super-peripherie' | null;
        slots?: Array<Slot>;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/slots/standard',
            query: {
                'zoneLevel': zoneLevel,
                'lat': lat,
                'lng': lng,
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
