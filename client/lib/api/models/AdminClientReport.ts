/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AdminClientReportItem } from './AdminClientReportItem';
export type AdminClientReport = {
    client?: {
        id?: number;
        name?: string | null;
        phone?: string | null;
        email?: string | null;
    };
    period?: {
        dateFrom?: string | null;
        dateTo?: string | null;
    };
    totals?: {
        totalOrders?: number;
        totalCourierCollected?: number;
        totalClientNet?: number;
        totalAdminNet?: number;
        totalDeliveryFees?: number;
    };
    items?: Array<AdminClientReportItem>;
};

