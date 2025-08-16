/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type OTPRequest = {
    channel: OTPRequest.channel;
    phone?: string | null;
    email?: string | null;
};
export namespace OTPRequest {
    export enum channel {
        SMS = 'sms',
        EMAIL = 'email',
    }
}

