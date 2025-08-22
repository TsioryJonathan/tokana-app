/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PricingQuoteRequest = {
    zoneLevel: PricingQuoteRequest.zoneLevel;
    type: PricingQuoteRequest.type;
    weight: number;
    parcels: number;
};
export namespace PricingQuoteRequest {
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

