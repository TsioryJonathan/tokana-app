/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AdminHistoryReport = {
    period?: {
        dateFrom?: string | null;
        dateTo?: string | null;
    };
    settlements?: Array<{
        courierId?: number;
        date?: string;
        status?: 'DECLARED' | 'CONFIRMED';
        cashAmount?: number | null;
        mobileMoneyAmount?: number | null;
        declaredAt?: string | null;
        confirmedAt?: string | null;
    }>;
    dispatches?: Array<{
        id?: number;
        clientId?: number;
        courierId?: number;
        status?: 'WAITING_COURIER' | 'IN_PROGRESS' | 'COMPLETED';
        netAmount?: number;
        cashAmount?: number;
        mobileMoneyAmount?: number;
        createdAt?: string;
    }>;
};

