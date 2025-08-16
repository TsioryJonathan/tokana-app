export type ServiceType = "STANDARD" | "EXPRESS";
export type DistanceBracket = "<5" | "5-10" | "10-20";

export type SenderState = { name: string; phone: string; address: string };
export type RecipientState = { name: string; phone: string; address: string };
export type ParcelState = {
  category: "ENVELOPE" | "SMALL" | "MEDIUM" | "LARGE";
  weightKg: string; // input text
  fragile: boolean;
  bulky: boolean;
};
export type ServiceState = {
  service: ServiceType;
  distanceKmBracket: DistanceBracket;
  needReturn: boolean;
};
export type PaymentState = { codAmountAr?: string; notes?: string };
