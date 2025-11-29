/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AdminDispatch = {
    id?: number;
    clientId?: number;
    courierId?: number;
    status?: AdminDispatch.status;
    netAmount?: number;
    cashAmount?: number;
    mobileMoneyAmount?: number;
};
export namespace AdminDispatch {
    export enum status {
        WAITING_COURIER = 'WAITING_COURIER',
        IN_PROGRESS = 'IN_PROGRESS',
        COMPLETED = 'COMPLETED',
    }
}

