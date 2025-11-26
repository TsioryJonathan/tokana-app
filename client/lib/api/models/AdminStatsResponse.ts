/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AdminStatsResponse = {
    ordersToday?: number;
    deliveredToday?: number;
    inProgress?: number;
    late?: number;
    heavyCount?: number;
    otpPending?: number;
    revenueToday?: number;
    now?: string;
    period?: AdminStatsResponse.period;
    start?: string;
    end?: string;
    global?: {
        totalAll?: number;
        deliveredAll?: number;
        inProgressAll?: number;
        lateAll?: number;
        totalClients?: number;
        totalLivreurs?: number;
    };
    /**
     * Order counts per day for the last 7 days (inclusive of today), index 0 = oldest
     */
    seriesOrders7d?: Array<number>;
};
export namespace AdminStatsResponse {
    export enum period {
        TODAY = 'today',
        _7D = '7d',
    }
}

