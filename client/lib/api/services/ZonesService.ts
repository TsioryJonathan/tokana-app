/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ZonePublicResponse } from '../models/ZonePublicResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class ZonesService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Get public zones (DB-only)
     * @returns ZonePublicResponse OK
     * @throws ApiError
     */
    public getApiZones(): CancelablePromise<ZonePublicResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/zones',
        });
    }
}
