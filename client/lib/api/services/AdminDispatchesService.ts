/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AdminClientPendingDispatchItem } from '../models/AdminClientPendingDispatchItem';
import type { AdminDispatch } from '../models/AdminDispatch';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class AdminDispatchesService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * List clients with pending net amounts to dispatch (J+1)
     * Returns all clients with delivered (expedie) orders that have not yet been
     * associated to a client dispatch. This is the entry point for building
     * J+1 dispatches per client.
     *
     * @param dateFrom Filter orders updatedAt >= dateFrom
     * @param dateTo Filter orders updatedAt <= dateTo
     * @returns any OK
     * @throws ApiError
     */
    public getApiAdminDispatchesPendingClients(
        dateFrom?: string,
        dateTo?: string,
    ): CancelablePromise<{
        items?: Array<AdminClientPendingDispatchItem>;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/admin/dispatches/pending-clients',
            query: {
                'dateFrom': dateFrom,
                'dateTo': dateTo,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden (admin only)`,
            },
        });
    }
    /**
     * List client dispatches
     * @param status
     * @param clientId
     * @param courierId
     * @returns AdminDispatch OK
     * @throws ApiError
     */
    public getApiAdminDispatches(
        status?: 'WAITING_COURIER' | 'IN_PROGRESS' | 'COMPLETED',
        clientId?: number,
        courierId?: number,
    ): CancelablePromise<Array<AdminDispatch>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/admin/dispatches',
            query: {
                'status': status,
                'clientId': clientId,
                'courierId': courierId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden (admin only)`,
            },
        });
    }
    /**
     * Create a new client dispatch
     * Creates a new dispatch for a client and a courier, and associates the
     * selected orders to this dispatch. Cash + mobileMoney must equal the
     * computed net client amount from the selected orders.
     *
     * @param requestBody
     * @returns any Created
     * @throws ApiError
     */
    public postApiAdminDispatches(
        requestBody: {
            clientId: number;
            courierId: number;
            orderIds: Array<number>;
            cashAmount: number;
            mobileMoneyAmount: number;
        },
    ): CancelablePromise<(AdminDispatch & {
        orderIds?: Array<number>;
    })> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/admin/dispatches',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
                403: `Forbidden (admin only)`,
            },
        });
    }
}
