// Slot generation service based on business rules
// Standard (J-1): orderable 04:00–23:00 (business TZ), delivery next day
// Express (J): orderable 06:00–15:00 (business TZ), ETA range (no maps yet)

import { DateTime } from 'luxon';

const ZONE_WINDOWS = {
  ville: { startHour: 10, endHour: 17 }, // 10:00–17:00
  peripherie: { startHour: 12, endHour: 17 }, // 12:00–17:00
  'super-peripherie': { startHour: 14, endHour: 17 }, // 14:00–17:00
};

const SLOT_DURATION_HOURS = 2; // 2h minimum

const TZ = process.env.BUSINESS_TZ || 'Indian/Antananarivo';
const DEV_ALWAYS_ON = (process.env.NODE_ENV !== 'production') && (String(process.env.SLOTS_DEV_ALWAYS_ON).toLowerCase() === 'true');

const inWindowTZ = (dateUtc, startHour, endHour) => {
  const h = DateTime.fromJSDate(dateUtc, { zone: 'utc' }).setZone(TZ).hour;
  return h >= startHour && h < endHour;
};

export function getExpressAvailability(nowUtc = new Date()) {
  // Order allowed 06:00–15:00 today in business TZ
  const allowed = DEV_ALWAYS_ON ? true : inWindowTZ(nowUtc, 6, 15);
  // Provide a simple ETA range (minutes) without maps
  const etaMin = 60;
  const etaMax = 120;
  return { allowed, etaMin, etaMax };
}

export function getStandardSlots(zoneLevel, nowUtc = new Date()) {
  const window = ZONE_WINDOWS[zoneLevel];
  if (!window) return [];
  // Convert current UTC to business day/time
  const nowZoned = DateTime.fromJSDate(nowUtc, { zone: 'utc' }).setZone(TZ);
  // Delivery next day in business TZ (truncate minutes/seconds)
  const deliveryZonedBase = nowZoned.plus({ days: 1 }).set({ minute: 0, second: 0, millisecond: 0 });

  const slots = [];
  for (let hour = window.startHour; hour + SLOT_DURATION_HOURS <= window.endHour; hour += 1) {
    const startZoned = deliveryZonedBase.set({ hour });
    const endZoned = deliveryZonedBase.set({ hour: hour + SLOT_DURATION_HOURS });
    // Convert business TZ times to UTC ISO for API
    const startISO = startZoned.toUTC().toISO();
    const endISO = endZoned.toUTC().toISO();
    slots.push({
      startISO,
      endISO,
      label: `${String(hour).padStart(2, '0')}:00–${String(hour + SLOT_DURATION_HOURS).padStart(2, '0')}:00`,
    });
  }
  return slots;
}

export function isStandardOrderWindow(nowUtc = new Date()) {
  // Order allowed 04:00–23:00 in business TZ (for creating a next-day delivery)
  return DEV_ALWAYS_ON ? true : inWindowTZ(nowUtc, 4, 23);
}
