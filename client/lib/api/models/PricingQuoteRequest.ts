/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PricingQuoteRequest = {
    /**
     * Optional if lat/lng provided
     */
    zoneLevel?: PricingQuoteRequest.zoneLevel;
    /**
     * Dropoff latitude (preferred)
     */
    lat?: number;
    /**
     * Dropoff longitude (preferred)
     */
    lng?: number;
    type: PricingQuoteRequest.type;
    weight: number;
    parcels: number;
};
export namespace PricingQuoteRequest {
    /**
     * Optional if lat/lng provided
     */
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

