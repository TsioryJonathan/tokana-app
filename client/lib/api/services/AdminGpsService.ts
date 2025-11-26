/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AdminCourierLocation } from '../models/AdminCourierLocation';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class AdminGpsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * List couriers and their last known GPS locations
     * Returns all delivery users (livreurs) with their last known latitude/longitude
     * and the timestamp of the last update.
     *
     * @param onlyActive If true, only return couriers with gpsTrackingEnabled = true
     * @returns any OK
     * @throws ApiError
     */
    public getApiAdminGpsCouriers(
        onlyActive?: boolean,
    ): CancelablePromise<{
        items?: Array<AdminCourierLocation>;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/admin/gps/couriers',
            query: {
                'onlyActive': onlyActive,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden (admin only)`,
            },
        });
    }
    /**
     * Enable or disable GPS tracking for a courier
     * @param id
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public patchApiAdminGpsCouriersTracking(
        id: number,
        requestBody: {
            enabled: boolean;
        },
    ): CancelablePromise<{
        id?: number;
        gpsTrackingEnabled?: boolean;
    }> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/admin/gps/couriers/{id}/tracking',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
                403: `Forbidden (admin only)`,
                404: `Not Found`,
            },
        });
    }
}
