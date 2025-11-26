/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AdminEveningSettlementsItem } from './AdminEveningSettlementsItem';
import type { CourierSettlementAdmin } from './CourierSettlementAdmin';
export type AdminEveningSettlementsResponse = {
    date?: string;
    courierId?: number | null;
    totals?: {
        totalOrders?: number;
        totalCourierCollected?: number;
        totalClientNet?: number;
        totalAdminNet?: number;
        totalDeliveryFees?: number;
    };
    items?: Array<AdminEveningSettlementsItem>;
    settlement?: CourierSettlementAdmin | null;
};

