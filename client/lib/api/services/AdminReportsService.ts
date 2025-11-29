/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AdminClientReport } from '../models/AdminClientReport';
import type { AdminHistoryReport } from '../models/AdminHistoryReport';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class AdminReportsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Get detailed client report for a period
     * Returns all orders for a given client over a date range, with financial
     * breakdown per order and aggregated totals.
     *
     * @param clientId Client (expéditeur) ID
     * @param dateFrom Filter orders createdAt >= dateFrom
     * @param dateTo Filter orders createdAt <= dateTo
     * @returns AdminClientReport OK
     * @throws ApiError
     */
    public getApiAdminReportsClient(
        clientId: number,
        dateFrom?: string,
        dateTo?: string,
    ): CancelablePromise<AdminClientReport> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/admin/reports/client',
            query: {
                'clientId': clientId,
                'dateFrom': dateFrom,
                'dateTo': dateTo,
            },
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
                403: `Forbidden (admin only)`,
            },
        });
    }
    /**
     * Get historical settlements and dispatches
     * Returns a lightweight history view combining courier evening settlements
     * and client dispatches over an optional date range.
     *
     * @param dateFrom Filter by created/settlement date >= dateFrom
     * @param dateTo Filter by created/settlement date <= dateTo
     * @returns AdminHistoryReport OK
     * @throws ApiError
     */
    public getApiAdminReportsHistory(
        dateFrom?: string,
        dateTo?: string,
    ): CancelablePromise<AdminHistoryReport> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/admin/reports/history',
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
}
