/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AdminStatsResponse } from '../models/AdminStatsResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class AdminStatsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Get admin KPIs and stats
     * Returns consolidated KPIs for the selected period and global aggregates.
     * Period `today` covers [start of today .. end of today] in server time.
     * Period `7d` covers the last 7 days including today.
     *
     * @param period Selects the period for KPIs. Defaults to 'today' if omitted.
     * @returns AdminStatsResponse OK
     * @throws ApiError
     */
    public getApiAdminStats(
        period: 'today' | '7d' = 'today',
    ): CancelablePromise<AdminStatsResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/admin/stats',
            query: {
                'period': period,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden (admin only)`,
            },
        });
    }
}
