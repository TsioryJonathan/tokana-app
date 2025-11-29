/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AdminEveningSettlementsItem = {
    id?: number;
    createdBy?: number | null;
    assignedTo?: number | null;
    status?: string;
    cashToCollect?: number | null;
    priceTotal?: number;
    isPrepaid?: boolean;
    deliveryFeePrepaid?: boolean;
    courierCollected?: number;
    clientNet?: number;
    adminNet?: number;
    deliveryFee?: number;
    /**
     * Simplified case classification (1-5) based on prepaid flags
     */
    caseType?: number;
};

