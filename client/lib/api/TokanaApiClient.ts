/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

import type { BaseHttpRequest } from "./core/BaseHttpRequest";
import type { OpenAPIConfig } from "./core/OpenAPI";
import { FetchHttpRequest } from "./core/FetchHttpRequest";
import { AdminUsersService } from "./services/AdminUsersService";
import { AdminZonesService } from "./services/AdminZonesService";
import { AuthService } from "./services/AuthService";
import { DeliveryOtpService } from "./services/DeliveryOtpService";
import { MeService } from "./services/MeService";
import { OrdersService } from "./services/OrdersService";
import { PricingService } from "./services/PricingService";
import { SlotsService } from "./services/SlotsService";
import { ZonesService } from "./services/ZonesService";
type HttpRequestConstructor = new (config: OpenAPIConfig) => BaseHttpRequest;
export class TokanaApiClient {
  public readonly adminUsers: AdminUsersService;
  public readonly adminZones: AdminZonesService;
  public readonly auth: AuthService;
  public readonly deliveryOtp: DeliveryOtpService;
  public readonly me: MeService;
  public readonly orders: OrdersService;
  public readonly pricing: PricingService;
  public readonly slots: SlotsService;
  public readonly zones: ZonesService;
  public readonly request: BaseHttpRequest;
  constructor(
    config?: Partial<OpenAPIConfig>,
    HttpRequest: HttpRequestConstructor = FetchHttpRequest
  ) {
    this.request = new HttpRequest({
      BASE: "http://localhost:5000",
      VERSION: config?.VERSION ?? "1.0.0",
      WITH_CREDENTIALS: config?.WITH_CREDENTIALS ?? false,
      CREDENTIALS: config?.CREDENTIALS ?? "include",
      TOKEN: config?.TOKEN,
      USERNAME: config?.USERNAME,
      PASSWORD: config?.PASSWORD,
      HEADERS: config?.HEADERS,
      ENCODE_PATH: config?.ENCODE_PATH,
    });
    this.adminUsers = new AdminUsersService(this.request);
    this.adminZones = new AdminZonesService(this.request);
    this.auth = new AuthService(this.request);
    this.deliveryOtp = new DeliveryOtpService(this.request);
    this.me = new MeService(this.request);
    this.orders = new OrdersService(this.request);
    this.pricing = new PricingService(this.request);
    this.slots = new SlotsService(this.request);
    this.zones = new ZonesService(this.request);
  }
}
