/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Order = {
    id?: number;
    type?: Order.type;
    zoneLevel?: Order.zoneLevel;
    pickupAddress?: string;
    dropoffAddress?: string;
    weight?: number;
    parcels?: number;
    cashToCollect?: number | null;
    /**
     * Madagascar: +261XXXXXXXXX or 0XXXXXXXXX (3x mobile, 20 landline)
     */
    recipientPhone?: string | null;
    recipientEmail?: string | null;
    status?: string;
    assignedTo?: number | null;
    createdBy?: number;
};
export namespace Order {
    export enum type {
        STANDARD = 'standard',
        EXPRESS = 'express',
    }
    export enum zoneLevel {
        VILLE = 'ville',
        PERIPHERIE = 'peripherie',
        SUPER_PERIPHERIE = 'super-peripherie',
    }
}

