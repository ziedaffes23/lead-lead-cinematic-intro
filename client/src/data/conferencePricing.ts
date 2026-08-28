export type ConferenceNationality = "" | "Tounsi" | "Other";
export type ConferencePosition = "" | "MMB" | "EB";

export const TUNISIAN_MMB_TND = 160;
export const TUNISIAN_EB_TND = 240;
export const INTERNATIONAL_MMB_EUR = 65;
export const INTERNATIONAL_EB_EUR = 90;
export const SINGLE_ROOM_SUPPLEMENT_TND = 50;
export const SINGLE_ROOM_SUPPLEMENT_EUR = 20;

export type Contribution = {
  price: number;
  currency: "TND" | "EUR";
  note: string;
};

export function getContribution(
  nationality: ConferenceNationality,
  position: ConferencePosition,
  singleRoom = false,
): Contribution | null {
  if (!nationality || !position) return null;

  if (nationality === "Other") {
    const basePrice = position === "MMB" ? INTERNATIONAL_MMB_EUR : INTERNATIONAL_EB_EUR;
    const roomSupplement = singleRoom ? SINGLE_ROOM_SUPPLEMENT_EUR : 0;
    const price = basePrice + roomSupplement;
    const roomNote = singleRoom
      ? ` Single room supplement: +${SINGLE_ROOM_SUPPLEMENT_EUR} EUR.`
      : " Shared room selected.";
    return {
      price,
      currency: "EUR",
      note: `EP / international ${position} package: ${basePrice} EUR for all three days.${roomNote}`,
    };
  }

  const basePrice = position === "MMB" ? TUNISIAN_MMB_TND : TUNISIAN_EB_TND;
  const roomSupplement = singleRoom ? SINGLE_ROOM_SUPPLEMENT_TND : 0;
  const price = basePrice + roomSupplement;
  const roomNote = singleRoom
    ? ` Single room supplement: +${SINGLE_ROOM_SUPPLEMENT_TND} TND.`
    : " Shared room selected.";

  return {
    price,
    currency: "TND",
    note: `Tunisian ${position} package: ${basePrice} TND.${roomNote}`,
  };
}
