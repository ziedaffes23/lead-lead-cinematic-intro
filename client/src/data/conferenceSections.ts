export const missionValues = [
  { code: "01", title: "The Invitation", copy: "Enter a focused room for people ready to take responsibility for what comes next.", tag: "MAIN QUEST" },
  { code: "02", title: "The Network", copy: "Meet local committees, new perspectives, and practical ambition on one shared route.", tag: "PARTY LINK" },
  { code: "03", title: "The Codex", copy: "Leave with ideas, commitments, and lessons that keep moving after the gathering ends.", tag: "ARCHIVE" },
] as const;

export const leadershipPrinciples = [
  ["01", "Activating Leadership", "Turn intention into a decision someone can act on."],
  ["02", "Demonstrating Integrity", "Make the clear choice, then own the follow-through."],
  ["03", "Living Diversity", "Build better routes by making room for every perspective."],
  ["04", "Enjoying Participation", "Bring energy to the room and make progress feel shared."],
  ["05", "Striving for Excellence", "Raise the standard without losing the human signal."],
  ["06", "Acting Sustainably", "Choose outcomes that keep working after the event is over."],
] as const;

export const registrationReadiness = [
  ["01", "Official details", "Have your first and last name, CIN number, phone number, Local Committee, and valid email address ready."],
  ["02", "Participation route", "Choose your nationality, position, and department. Your contribution is shown before you submit."],
  ["03", "Identity document", "Upload a CIN or passport image/PDF. Profile photo and CV remain optional."],
  ["04", "Confirmed record", "A receipt appears only after the official registration sheet confirms your submission."],
] as const;

const lcLogo = (file: string) => `/assets/lcs/${file}.png`;

export const conferenceFactions = [
  { id: "thyna", name: "LC Thyna", logo: lcLogo("thyna"), logoTreatment: "transparent", established: "Since 1997", detail: "LC Thyna", slogan: "للقمة و نقودوها" },
  { id: "university", name: "LC University", logo: lcLogo("university"), logoTreatment: "paper", established: "Since 1987", detail: "LC University", slogan: "لوكال يشعل بالنار" },
  { id: "bullaregia", name: "SU Bullaregia", logo: lcLogo("bullaregia"), logoTreatment: "paper", established: "Since 2025", detail: "SU Bullaregia", slogan: "The north will remember" },
  { id: "tacapes", name: "LC Tacapes", logo: lcLogo("tacapes"), logoTreatment: "paper", established: "Since 2014", detail: "LC Tacapes", slogan: "تكاباس الحب" },
  { id: "ruspina", name: "LC Ruspina", logo: lcLogo("ruspina"), logoTreatment: "paper", established: "Since 2014", detail: "LC Ruspina", slogan: "روسبينا امانة" },
  { id: "carthage", name: "LC Carthage", logo: lcLogo("carthage"), logoTreatment: "paper", established: "Since 1962", detail: "LC Carthage", slogan: "قرطاج متزول" },
  { id: "sfax", name: "LC Sfax", logo: lcLogo("sfax"), logoTreatment: "paper", established: "Since 1987", detail: "LC Sfax", slogan: "صفاقس حاضرين" },
  { id: "bardo", name: "LC Bardo", logo: lcLogo("bardo"), logoTreatment: "paper", established: "Since 1984", detail: "LC Bardo", slogan: "نعطيها عينيا و وقت طويل" },
  { id: "bizerte", name: "LC Bizerte", logo: lcLogo("bizerte"), logoTreatment: "paper", established: "Since 2012", detail: "LC Bizerte", slogan: "بنزرت تعيش تعيش نعيش" },
  { id: "hadrumet", name: "LC Hadrumet", logo: lcLogo("hadrumet"), logoTreatment: "paper", established: "Since 2009", detail: "LC Hadrumet", slogan: "حضرموت هنا و ستحقق احلامها الكبرى" },
  { id: "medina", name: "LC Medina", logo: lcLogo("medina"), logoTreatment: "paper", established: "Since 1989", detail: "LC Medina", slogan: "مدينة ما ننساك" },
  { id: "nabel", name: "LC Nabel", logo: lcLogo("nabel"), logoTreatment: "paper", established: "Since 2005", detail: "LC Nabel", slogan: "نابل فالقلب" },
] as const;

export function pad(value: number) {
  return String(value).padStart(2, "0");
}
