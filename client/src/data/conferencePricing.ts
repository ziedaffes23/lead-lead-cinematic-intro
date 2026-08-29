export type ConferenceNationality = "" | "Tounsi";
export type ConferenceTrack = "" | "MMB" | "EB";

export const TUNISIAN_MMB_TND = 160;
export const TUNISIAN_EB_TND = 240;
export const ACCOMMODATION_PER_NIGHT_TND = 80;
export const SINGLE_ROOM_SURCHARGE_TND = 50;
export const MMB_DURATION_DAYS = 3;
export const EB_DURATION_DAYS = 4;

export type Contribution = {
  price: number;
  currency: "TND";
  note: string;
};

export function getContribution(
  nationality: ConferenceNationality,
  track: ConferenceTrack,
  singleRoom = false,
): Contribution | null {
  if (nationality !== "Tounsi" || !track) return null;

  const isMmb = track === "MMB";
  const basePrice = isMmb ? TUNISIAN_MMB_TND : TUNISIAN_EB_TND;
  const durationDays = isMmb ? MMB_DURATION_DAYS : EB_DURATION_DAYS;
  const price = basePrice + (singleRoom ? SINGLE_ROOM_SURCHARGE_TND : 0);
  const roomNote = singleRoom
    ? ` Single room selected: +${SINGLE_ROOM_SURCHARGE_TND} TND.`
    : ` Shared room selected. Single room surcharge: +${SINGLE_ROOM_SURCHARGE_TND} TND.`;

  return {
    price,
    currency: "TND",
    note: `Tunisian ${track} package: ${basePrice} TND for ${durationDays} days.${roomNote}`,
  };
}
