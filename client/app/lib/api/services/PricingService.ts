/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PricingQuoteRequest } from '../models/PricingQuoteRequest';
import type { PricingQuoteResponse } from '../models/PricingQuoteResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class PricingService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Get pricing quote
     * @param requestBody
     * @returns PricingQuoteResponse OK
     * @throws ApiError
     */
    public postApiPricingQuote(
        requestBody: PricingQuoteRequest,
    ): CancelablePromise<PricingQuoteResponse> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/pricing/quote',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
            },
        });
    }
}
