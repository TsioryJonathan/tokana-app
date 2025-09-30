/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type User = {
    id?: number;
    email?: string | null;
    /**
     * Stored normalized E.164 format for Madagascar: +261(3x|20)xxxxxxx
     */
    phone?: string | null;
    phoneVerifiedAt?: string | null;
    emailVerifiedAt?: string | null;
    name?: string | null;
    role?: User.role;
};
export namespace User {
    export enum role {
        CLIENT = 'client',
        LIVREUR = 'livreur',
        ADMIN = 'admin',
    }
}

