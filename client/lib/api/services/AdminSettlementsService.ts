/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AdminEveningSettlementsResponse } from '../models/AdminEveningSettlementsResponse';
import type { CourierSettlementAdmin } from '../models/CourierSettlementAdmin';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class AdminSettlementsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Confirm evening settlement for a courier on a given date
     * Marks the evening settlement of a courier as CONFIRMED for a given date.
     * The client is expected to send the cash/mobile money breakdown. If a record
     * already exists for this courier/date, it will be updated.
     *
     * @param requestBody
     * @returns CourierSettlementAdmin OK
     * @throws ApiError
     */
    public postApiAdminSettlementsEveningConfirm(
        requestBody: {
            date: string;
            courierId: number;
            cashAmount?: number | null;
            mobileMoneyAmount?: number | null;
        },
    ): CancelablePromise<CourierSettlementAdmin> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/admin/settlements/evening/confirm',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
                403: `Forbidden (admin only)`,
            },
        });
    }
    /**
     * Get evening settlements for a courier on a given date
     * Returns all delivered (expedie) orders for a given courier and date,
     * along with aggregated totals and a per-order financial breakdown.
     *
     * @param date Date of the evening settlement (server local date). Defaults to today if omitted.
     * @param courierId Filter by courier (assignedTo). If omitted, includes all couriers.
     * @returns AdminEveningSettlementsResponse OK
     * @throws ApiError
     */
    public getApiAdminSettlementsEvening(
        date?: string,
        courierId?: number,
    ): CancelablePromise<AdminEveningSettlementsResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/admin/settlements/evening',
            query: {
                'date': date,
                'courierId': courierId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden (admin only)`,
            },
        });
    }
}
