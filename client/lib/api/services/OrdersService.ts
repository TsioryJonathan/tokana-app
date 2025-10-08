/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Order } from '../models/Order';
import type { OrderStatusHistory } from '../models/OrderStatusHistory';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class OrdersService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Create order
     * @param requestBody
     * @returns Order Created
     * @throws ApiError
     */
    public postApiOrders(
        requestBody: {
            type: 'standard' | 'express';
            /**
             * Optional if lat/lng or dropoffLocalityId provided
             */
            zoneLevel?: 'ville' | 'peripherie' | 'super-peripherie';
            /**
             * Dropoff latitude (preferred)
             */
            lat?: number;
            /**
             * Dropoff longitude (preferred)
             */
            lng?: number;
            pickupAddress: string;
            dropoffAddress: string;
            weight: number;
            parcels: number;
            cashToCollect?: number | null;
            /**
             * Madagascar: +261XXXXXXXXX or 0XXXXXXXXX (3x mobile, 20 landline)
             */
            recipientPhone?: string | null;
            recipientEmail?: string;
            slotStart?: string;
            slotEnd?: string;
        },
    ): CancelablePromise<Order> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/orders',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Validation error`,
                401: `Unauthorized`,
                409: `Conflict (slot not allowed or business rule conflict)`,
            },
        });
    }
    /**
     * List orders (scoped)
     * @param assignedTo
     * @param mine
     * @returns Order OK
     * @throws ApiError
     */
    public getApiOrders(
        assignedTo?: 'me',
        mine?: boolean,
    ): CancelablePromise<Array<Order>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/orders',
            query: {
                'assignedTo': assignedTo,
                'mine': mine,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Get order by id
     * @param id
     * @returns Order OK
     * @throws ApiError
     */
    public getApiOrders1(
        id: number,
    ): CancelablePromise<Order> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/orders/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                404: `Not Found`,
            },
        });
    }
    /**
     * Assign/unassign order (admin)
     * @param id
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public patchApiOrdersAssign(
        id: number,
        requestBody: {
            assignedTo?: number | null;
        },
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/orders/{id}/assign',
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
     * Get order status history
     * @param id
     * @returns OrderStatusHistory OK
     * @throws ApiError
     */
    public getApiOrdersHistory(
        id: number,
    ): CancelablePromise<Array<OrderStatusHistory>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/orders/{id}/history',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                404: `Not Found`,
            },
        });
    }
    /**
     * List order remarks
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public getApiOrdersRemarks(
        id: number,
    ): CancelablePromise<Array<{
        id?: number;
        text?: string;
        createdAt?: string;
        createdBy?: number | null;
    }>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/orders/{id}/remarks',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                404: `Not Found`,
            },
        });
    }
    /**
     * Add order remark
     * @param id
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public postApiOrdersRemarks(
        id: number,
        requestBody: {
            text: string;
        },
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/orders/{id}/remarks',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * Update order status
     * @param id
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public patchApiOrdersStatus(
        id: number,
        requestBody: {
            status: string;
        },
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/orders/{id}/status',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
                409: `Conflict (invalid status transition)`,
            },
        });
    }
}
