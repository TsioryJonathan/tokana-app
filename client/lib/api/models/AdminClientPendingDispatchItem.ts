/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AdminClientPendingDispatchItem = {
    clientId?: number;
    clientName?: string | null;
    clientPhone?: string | null;
    clientEmail?: string | null;
    netClient?: number;
    orders?: Array<{
        id?: number;
        status?: string;
        cashToCollect?: number | null;
        priceTotal?: number;
        isPrepaid?: boolean;
        deliveryFeePrepaid?: boolean;
        clientNet?: number;
    }>;
};

