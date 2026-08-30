/**
 * Moonlit Relic Chase style contract. Storage-backed artwork can be hosted on
 * any public bucket through VITE_PUBLIC_ASSET_BASE_URL; Railway remains usable
 * with the tracked local fallback artwork when that variable is absent.
 */
import { assetUrl } from "@/lib/assetUrl";

const fallback = "/assets/lead-lead-fallback.svg";
const rooftop = "/assets/thyna-rooftop-background.png";
const city = "/assets/lead-lead-city-background-v2.png";

export const CINEMATIC_ASSETS = {
  logo: assetUrl("/manus-storage/lead-lead-official-logo_f7b00492.png", fallback),
  emblem: assetUrl("/manus-storage/lead-lead-2k26-emblem_777efc54.png", fallback),
  rooftopReference: assetUrl("/manus-storage/lead-lead-moonlit-rooftop_f19ec9d4.jpg", city),
  thynaRooftopBackground: rooftop,
  stoneTexture: assetUrl("/manus-storage/lead-lead-stone-material_8e8d229b.jpg", rooftop),
  spark: assetUrl("/manus-storage/lead-lead-impact-spark_4cf543da.png", fallback),
  haze: assetUrl("/manus-storage/lead-lead-haze-banner_29cf0119.jpg", city),
  courierCloth: assetUrl("/manus-storage/original-courier-cloth_4ef20523.jpg", rooftop),
  courierLeather: assetUrl("/manus-storage/original-courier-leather_c9a4f18d.jpg", rooftop),
  courierCharacter: assetUrl("/manus-storage/original-courier-character-cutout_44180e1b.png", fallback),
  courierSprint: assetUrl("/manus-storage/original-courier-sprint_b7d73961.png", fallback),
  courierVault: assetUrl("/manus-storage/original-courier-vault_6b4fc1a5.png", fallback),
  courierGrab: assetUrl("/manus-storage/original-courier-grab_2dedd96d.png", fallback),
  courierThrow: assetUrl("/manus-storage/original-courier-throw_f998fb71.png", fallback),
  character: "/assets/character.glb",
  environment: "/assets/environment.glb",
  object: "/assets/object.glb",
  entryMusic: "/audio/ezios-family.mp3",
} as const;

export const CHARACTER_CONFIG = {
  /** Set this to the right-hand bone name used by the replacement character GLB. */
  handBoneName: "RightHand",
  animationMap: {
    idle: "Idle",
    sprint: "Sprint",
    vault: "Vault",
    grab: "Grab",
    throw: "Throw",
  },
} as const;

export type CinematicAssetConfig = typeof CINEMATIC_ASSETS;
