/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PricingQuoteResponse = {
    zoneLevel?: PricingQuoteResponse.zoneLevel;
    type?: PricingQuoteResponse.type;
    weight?: number;
    parcels?: number;
    fees?: {
        pickupFee?: number;
        deliveryFee?: number;
        expressSurcharge?: number;
    };
    priceTotal?: number;
    requiresManualHandling?: boolean;
    instructions?: string | null;
    /**
     * E.164 or local format
     */
    contactPhone?: string | null;
};
export namespace PricingQuoteResponse {
    export enum zoneLevel {
        VILLE = 'ville',
        PERIPHERIE = 'peripherie',
        SUPER_PERIPHERIE = 'super-peripherie',
    }
    export enum type {
        STANDARD = 'standard',
        EXPRESS = 'express',
    }
}

