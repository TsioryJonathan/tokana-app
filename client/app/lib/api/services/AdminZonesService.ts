/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Axis } from '../models/Axis';
import type { Locality } from '../models/Locality';
import type { Zone } from '../models/Zone';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class AdminZonesService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * List zones
     * @returns Zone OK
     * @throws ApiError
     */
    public getApiAdminZones(): CancelablePromise<Array<Zone>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/admin/zones',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden (admin only)`,
            },
        });
    }
    /**
     * Create zone
     * @param requestBody
     * @returns any Created
     * @throws ApiError
     */
    public postApiAdminZones(
        requestBody: {
            key: 'ville' | 'peripherie' | 'super-peripherie';
            label: string;
        },
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/admin/zones',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden (admin only)`,
                409: `Conflict (zone key already exists)`,
            },
        });
    }
    /**
     * Update zone label
     * @param id
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public putApiAdminZones(
        id: number,
        requestBody: {
            label: string;
        },
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/api/admin/zones/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden (admin only)`,
                404: `Not Found`,
            },
        });
    }
    /**
     * Delete zone
     * @param id
     * @returns void
     * @throws ApiError
     */
    public deleteApiAdminZones(
        id: number,
    ): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/admin/zones/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden (admin only)`,
                404: `Not Found`,
            },
        });
    }
    /**
     * List axes for zone
     * @param zoneId
     * @returns Axis OK
     * @throws ApiError
     */
    public getApiAdminZonesAxes(
        zoneId: number,
    ): CancelablePromise<Array<Axis>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/admin/zones/{zoneId}/axes',
            path: {
                'zoneId': zoneId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden (admin only)`,
                404: `Zone Not Found`,
            },
        });
    }
    /**
     * Create axis for zone
     * @param zoneId
     * @param requestBody
     * @returns any Created
     * @throws ApiError
     */
    public postApiAdminZonesAxes(
        zoneId: number,
        requestBody: {
            key: 'nord' | 'est' | 'sud' | 'ouest' | 'nord_ouest' | 'sud_ouest';
            label: string;
        },
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/admin/zones/{zoneId}/axes',
            path: {
                'zoneId': zoneId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden (admin only)`,
                404: `Zone Not Found`,
                409: `Conflict (axis key already exists for zone)`,
            },
        });
    }
    /**
     * Update axis label
     * @param id
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public putApiAdminZonesAxes(
        id: number,
        requestBody: {
            label: string;
        },
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/api/admin/zones/axes/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden (admin only)`,
                404: `Axis Not Found`,
            },
        });
    }
    /**
     * Delete axis
     * @param id
     * @returns void
     * @throws ApiError
     */
    public deleteApiAdminZonesAxes(
        id: number,
    ): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/admin/zones/axes/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden (admin only)`,
                404: `Axis Not Found`,
            },
        });
    }
    /**
     * List localities for axis
     * @param axisId
     * @returns Locality OK
     * @throws ApiError
     */
    public getApiAdminZonesAxesLocalities(
        axisId: number,
    ): CancelablePromise<Array<Locality>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/admin/zones/axes/{axisId}/localities',
            path: {
                'axisId': axisId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden (admin only)`,
                404: `Axis Not Found`,
            },
        });
    }
    /**
     * Create locality for axis
     * @param axisId
     * @param requestBody
     * @returns any Created
     * @throws ApiError
     */
    public postApiAdminZonesAxesLocalities(
        axisId: number,
        requestBody: {
            name: string;
        },
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/admin/zones/axes/{axisId}/localities',
            path: {
                'axisId': axisId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden (admin only)`,
                404: `Axis Not Found`,
                409: `Conflict (locality already exists on this axis)`,
            },
        });
    }
    /**
     * Update locality name
     * @param id
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public putApiAdminZonesLocalities(
        id: number,
        requestBody: {
            name: string;
        },
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/api/admin/zones/localities/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden (admin only)`,
                404: `Locality Not Found`,
                409: `Conflict (locality name duplicate on axis)`,
            },
        });
    }
    /**
     * Delete locality
     * @param id
     * @returns void
     * @throws ApiError
     */
    public deleteApiAdminZonesLocalities(
        id: number,
    ): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/admin/zones/localities/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden (admin only)`,
                404: `Locality Not Found`,
            },
        });
    }
}
