/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Order = {
    [x: string]: any;
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
    /**
     * Whether the delivery OTP has been verified for this order
     */
    otpVerified?: boolean;
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

