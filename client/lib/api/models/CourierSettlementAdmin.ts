/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CourierSettlementAdmin = {
    courierId?: number;
    date?: string;
    status?: CourierSettlementAdmin.status;
    cashAmount?: number | null;
    mobileMoneyAmount?: number | null;
    declaredAt?: string | null;
    confirmedAt?: string | null;
};
export namespace CourierSettlementAdmin {
    export enum status {
        DECLARED = 'DECLARED',
        CONFIRMED = 'CONFIRMED',
    }
}

