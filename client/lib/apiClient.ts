import { OpenAPI } from "./api";

export function configureApi(baseUrl: string, token?: string) {
  OpenAPI.BASE = baseUrl;
  OpenAPI.TOKEN = token;
}
