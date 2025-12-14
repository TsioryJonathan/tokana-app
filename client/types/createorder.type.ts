export type ServiceType = "STANDARD" | "EXPRESS";
export type DistanceBracket = "<5" | "5-10" | "10-20";

export type SenderState = { 
  name: string; 
  phone: string; 
  address: string; 
  adresseExacte?: string;
  savedAddressId?: string;
  remarks?: string;
};
export type RecipientState = { name: string; phone: string; address: string; email?: string };
export type ParcelState = {
  category: "ENVELOPE" | "SMALL" | "MEDIUM" | "LARGE" | "CUSTOM";
  weightKg: string; // input text
  fragile: boolean;
  bulky: boolean;
  parcelsCount?: string; // input text, defaults to 1
  customDimensions?: string; // pour valeur précise (LxlxH en cm)
};
export type ServiceState = {
  service: ServiceType;
  distanceKmBracket: DistanceBracket;
  needReturn: boolean;
};
export type PaymentState = { codAmountAr?: string; notes?: string };
