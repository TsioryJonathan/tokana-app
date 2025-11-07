import {
  DistanceBracket,
  ParcelState,
  ServiceState,
  ServiceType,
} from "../types/createorder.type";

const SURCHARGE = {
  fragile: 500,
  bulky: 500,
  heavyPer5Kg: 500,
  returnNeeded: 1000,
};

function toNumberSafe(v?: string) {
  const n = Number((v ?? "").toString().replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}
function basePrice(distance: DistanceBracket, service: ServiceType) {
  if (distance === "<5") return service === "STANDARD" ? 3000 : 4000;
  if (distance === "5-10") return service === "STANDARD" ? 3500 : 4500;
  return service === "STANDARD" ? 4000 : 5000;
}
function computeSurcharges(parcel: ParcelState, svc: ServiceState) {
  let s = 0;
  if (parcel.fragile) s += SURCHARGE.fragile;
  if (parcel.bulky) s += SURCHARGE.bulky;
  const w = toNumberSafe(parcel.weightKg);
  if (w > 5) s += Math.ceil((w - 5) / 5) * SURCHARGE.heavyPer5Kg;
  if (svc.needReturn) s += SURCHARGE.returnNeeded;
  return s;
}
function formatAr(n: number) {
  return `${n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} Ar`;
}

export {
  SURCHARGE,
  toNumberSafe,
  basePrice,
  computeSurcharges,
  formatAr,
};
