/**
 * Secured Rooftop Archive style contract: a moonstone delegate dossier moves from information to profile,
 * then review and receipt, with optional attachments protected by a constrained server-side storage handoff.
 */
import { FormEvent, useMemo, useState } from "react";
import { CinematicBackground } from "@/components/CinematicBackground";
import { ConferenceHeader } from "@/components/ConferenceHeader";
import { ConferenceFooter } from "@/components/ConferenceFooter";
import { CINEMATIC_ASSETS } from "@/game/assets";
import { trpc } from "@/lib/trpc";
import { LOCAL_COMMITTEES, localCommitteeFromSearch } from "@shared/registration";
import { getContribution } from "@/data/conferencePricing";
import "@/styles/conference.css";
import "@/styles/motion.css";
import "@/styles/rooftop-chase-pages.css";
import "@/styles/cinematic-polish.css";
import "@/styles/rooftop-chase-refinement.css";
import "@/styles/route-world-overhaul.css";
import "@/styles/registration-flow.css";
import "@/styles/registration-cinematic-refinement.css";
import "@/styles/registration-review-receipt.css";
import "@/styles/registration-attachments.css";
import "@/styles/registration-polish.css";
import "@/styles/registration-depth.css";
import "@/styles/registration-refresh.css";
import "@/styles/registration-contrast-fix.css";
import "@/styles/registration-homeworld.css";
import "@/styles/conference-navigation.css";
import "@/styles/mobile-layout.css";

const lcs = LOCAL_COMMITTEES;
const departments = ["IM — Information Management", "F&L — Finance & Legal", "OGV — Outgoing Global Volunteer", "IGV — Incoming Global Volunteer", "OGT — Outgoing Global Talent", "IGT — Incoming Global Talent", "BD — Business Development", "MKT — Marketing", "Other"];
const photoTypes = ["image/jpeg", "image/png", "image/webp"];
const identityTypes = ["image/jpeg", "image/png", "application/pdf"];
const phoneCountries = [
  ["+216", "Tunisia"], ["+33", "France"], ["+49", "Germany"], ["+39", "Italy"], ["+34", "Spain"], ["+44", "United Kingdom"], ["+1", "United States / Canada"], ["+20", "Egypt"], ["+212", "Morocco"], ["+213", "Algeria"], ["+971", "United Arab Emirates"], ["+90", "Türkiye"], ["+", "International / other"],
] as const;

type Nationality = "" | "Tounsi";
type Track = "" | "MMB" | "EB";
type Position = "" | "Manager" | "Team Leader" | "LCVP" | "LCP";
type FormState = { firstName: string; lastName: string; cin: string; lc: string; phoneCountry: string; phone: string; email: string; nationality: Nationality; track: Track; position: Position; singleRoom: boolean; department: string; allergies: string; note: string; };
type Errors = Partial<Record<keyof FormState, string>>;
type RegistrationStage = 1 | 2 | 3 | "receipt";
type AttachmentKey = "photo" | "cv" | "identity";
type AttachmentState = { file: File; name: string; size: number } | null;
type UploadedDocuments = { photo?: { name: string; url: string }; cv?: { name: string; url: string }; identity?: { name: string; url: string } };
type Receipt = { form: FormState; price: number; currency: string; contributionNote: string; documents: UploadedDocuments; reference: string; recordedAt: string };

const initial: FormState = { firstName: "", lastName: "", cin: "", lc: "LC Thyna", phoneCountry: "+216", phone: "", email: "", nationality: "", track: "", position: "", singleRoom: false, department: "", allergies: "", note: "" };
const informationFields: Array<keyof FormState> = ["firstName", "lastName", "cin", "lc", "phoneCountry", "phone", "email"];
const participationFields: Array<keyof FormState> = ["nationality", "track", "position", "department", "allergies", "note"];

function contribution(form: Pick<FormState, "nationality" | "track" | "singleRoom">) {
  return getContribution(form.nationality, form.track, form.singleRoom);
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return <div><dt>{label}</dt><dd>{value}</dd></div>;
}

function formatBytes(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(bytes < 1024 * 1024 ? 1 : 2)} MB`;
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("The selected file could not be read."));
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("The selected file could not be read."));
    reader.readAsDataURL(file);
  });
}

export default function Register() {
  const isEmbedded = new URLSearchParams(window.location.search).get("embed") === "1";
  const [form, setForm] = useState<FormState>(() => ({ ...initial, lc: localCommitteeFromSearch(window.location.search) }));
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "upload" | "error">("idle");
  const [stage, setStage] = useState<RegistrationStage>(1);
  const [attachments, setAttachments] = useState<Record<AttachmentKey, AttachmentState>>({ photo: null, cv: null, identity: null });
  const [attachmentErrors, setAttachmentErrors] = useState<Partial<Record<AttachmentKey, string>>>({});
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [documents, setDocuments] = useState<UploadedDocuments | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const uploadDocuments = trpc.registration.uploadDocuments.useMutation();
  const submitRegistration = trpc.registration.submit.useMutation();
  const recordLeaderboard = trpc.registration.record.useMutation();
  const fee = useMemo(() => contribution(form), [form.nationality, form.track, form.singleRoom]);
  const stageNumber = stage === "receipt" ? 3 : stage;

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => ({ ...current, [key]: value }));
  const validate = (fields: Array<keyof FormState>) => {
    const next: Errors = {};
    if (fields.includes("firstName") && !form.firstName.trim()) next.firstName = "First name is required.";
    if (fields.includes("lastName") && !form.lastName.trim()) next.lastName = "Last name is required.";
    if (fields.includes("cin") && !form.cin.trim()) next.cin = "CIN number is required and remains text.";
    if (fields.includes("lc") && !form.lc) next.lc = "Select a local committee.";
    if (fields.includes("phoneCountry") && !form.phoneCountry) next.phoneCountry = "Select a country code.";
    if (fields.includes("phone") && !/^[0-9 -]{6,14}$/.test(form.phone.trim())) next.phone = "Use 6–14 digits, spaces, or hyphens.";
    if (fields.includes("email") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(form.email.trim())) next.email = "Use a valid email address.";
    if (fields.includes("nationality") && !form.nationality) next.nationality = "Select your nationality.";
    if (fields.includes("track") && !form.track) next.track = "Select your conference track.";
    if (fields.includes("position") && !form.position) next.position = "Select a position.";
    if (fields.includes("department") && !form.department) next.department = "Select a department.";
    if (fields.includes("allergies") && !form.allergies.trim()) next.allergies = "Enter none if you have no allergies or dietary concerns.";
    if (fields.includes("note") && !form.note.trim()) next.note = "Enter none if you have no additional note.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };
  const goTo = (nextStage: 1 | 2 | 3) => { setErrors({}); setStatus("idle"); setStage(nextStage); };
  const continueToParticipation = () => { if (validate(informationFields)) goTo(2); };
  const validateAttachments = () => {
    const next: Partial<Record<AttachmentKey, string>> = {};
    if (!attachments.identity) next.identity = "CIN or passport upload is required.";
    if (!attachments.photo) next.photo = "Profile photo is required.";
    if (!attachments.cv) next.cv = "CV / résumé is required.";
    setAttachmentErrors(next);
    return Object.keys(next).length === 0;
  };
  const continueToReview = () => { if (validate(participationFields) && validateAttachments()) goTo(3); };
  const selectAttachment = (key: AttachmentKey, candidate?: File) => {
    if (!candidate) return;
    const isValid = key === "photo" ? photoTypes.includes(candidate.type) && candidate.size <= 3 * 1024 * 1024 : key === "identity" ? identityTypes.includes(candidate.type) && candidate.size <= 5 * 1024 * 1024 : candidate.type === "application/pdf" && candidate.size <= 5 * 1024 * 1024;
    if (!isValid) {
      setAttachmentErrors((current) => ({ ...current, [key]: key === "photo" ? "Use a JPG, PNG, or WebP image up to 3 MB." : key === "identity" ? "Use a JPG, PNG, or PDF document up to 5 MB." : "Use a PDF CV up to 5 MB." }));
      return;
    }
    setAttachmentErrors((current) => ({ ...current, [key]: undefined }));
    setAttachments((current) => ({ ...current, [key]: { file: candidate, name: candidate.name, size: candidate.size } }));
    setDocuments(null);
  };
  const removeAttachment = (key: AttachmentKey) => {
    setAttachments((current) => ({ ...current, [key]: null }));
    setAttachmentErrors((current) => ({ ...current, [key]: undefined }));
    setDocuments(null);
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("idle");
    setSubmissionMessage("");
    if (!validate(informationFields)) { setStage(1); return; }
    if (!validate(participationFields)) { setStage(2); return; }
    if (!validateAttachments()) { setStage(2); return; }
    if (form.nationality !== "Tounsi" || !form.track || !form.position) { setStage(2); return; }
    const track = form.track;
    const position = form.position;
    const selectedFee = contribution(form);
    if (!selectedFee) { setStage(2); return; }
    setStatus("sending");
    let nextDocuments = documents;
    if (!nextDocuments && (attachments.photo || attachments.cv || attachments.identity)) {
      try {
        const [photoData, cvData, identityData] = await Promise.all([
          attachments.photo ? readFileAsDataUrl(attachments.photo.file) : Promise.resolve(undefined),
          attachments.cv ? readFileAsDataUrl(attachments.cv.file) : Promise.resolve(undefined),
          attachments.identity ? readFileAsDataUrl(attachments.identity.file) : Promise.resolve(undefined),
        ]);
        nextDocuments = await uploadDocuments.mutateAsync({
          photo: attachments.photo && photoData ? { name: attachments.photo.name, mimeType: attachments.photo.file.type, dataUrl: photoData } : undefined,
          cv: attachments.cv && cvData ? { name: attachments.cv.name, mimeType: attachments.cv.file.type, dataUrl: cvData } : undefined,
          identity: attachments.identity && identityData ? { name: attachments.identity.name, mimeType: attachments.identity.file.type, dataUrl: identityData } : undefined,
        });
        setDocuments(nextDocuments);
      } catch {
        setStatus("upload");
        return;
      }
    }
    try {
      const confirmation = await submitRegistration.mutateAsync({ ...form, nationality: "Tounsi", track, position, price: selectedFee.price, currency: selectedFee.currency, photoUrl: nextDocuments?.photo?.url ?? "", photoName: nextDocuments?.photo?.name ?? "", cvUrl: nextDocuments?.cv?.url ?? "", cvName: nextDocuments?.cv?.name ?? "", identityUrl: nextDocuments?.identity?.url ?? "", identityName: nextDocuments?.identity?.name ?? "" });
      const receiptDocuments = confirmation.documents ?? nextDocuments ?? {};
      try {
        await recordLeaderboard.mutateAsync({ lc: form.lc, email: form.email });
      } catch {
        // The organiser endpoint has already accepted the record; a later successful submission can repair a transient leaderboard sync failure.
      }
      setReceipt({ form: { ...form }, price: selectedFee.price, currency: selectedFee.currency, contributionNote: selectedFee.note, documents: receiptDocuments, reference: `LL26-${String(Date.now()).slice(-6)}`, recordedAt: new Date().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) });
      setStage("receipt");
    } catch (error) {
      setSubmissionMessage(error instanceof Error ? error.message : "The registration service could not confirm your record.");
      setStatus("error");
    }
  };
  const error = (key: keyof FormState) => errors[key] ? <small className="field-error" role="alert">{errors[key]}</small> : null;
  const progressClass = (value: 1 | 2 | 3) => stageNumber === value ? "is-active" : stageNumber > value ? "is-complete" : "";
  const heading = stage === "receipt" ? "Registration receipt" : stage === 1 ? "Basic information" : stage === 2 ? "Participation details" : "Review your dossier";

  return (
    <main className="registration-site chase-route chase-register cinematic-world-root">
      <CinematicBackground tone="dossier" />
      <div className="route-entry-wipe" aria-hidden="true" />
      <div className="route-pressure-lines" aria-hidden="true"><i /><i /><i /></div>
      <div className="dossier-relic-route" aria-hidden="true"><i /></div>
      <div className="register-backdrop" style={{ backgroundImage: `url(${CINEMATIC_ASSETS.rooftopReference})` }} aria-hidden="true" />
      <div className="register-rails" aria-hidden="true"><i /><i /></div>
      <img className="register-courier" src={CINEMATIC_ASSETS.courierGrab} alt="" aria-hidden="true" />
      <div className="register-relic-trace" aria-hidden="true"><i /></div>
      {isEmbedded ? <header className="register-header"><button type="button" className="back-link" onClick={() => window.parent.postMessage({ type: "lead-lead-registration-close" }, window.location.origin)}>← CLOSE REGISTRATION</button><div className="register-event-brand"><img src="/manus-storage/lead-lead-2k26-emblem_777efc54.png" alt="Lead & Lead 2K26 conference logo" /><span>LEAD &amp; LEAD <small>2K26 CONFERENCE</small></span></div></header> : <ConferenceHeader current="register" />}
      <div className="register-layout">
        <aside className="dossier-intro"><p className="eyebrow">CHAPTER VI / DELEGATE DOSSIER</p><h1>{stage === "receipt" ? "The record is sealed." : "Answer the call."}</h1><dl><div><dt>STARTS</dt><dd>10 September 2026</dd></div><div><dt>DURATION</dt><dd>{form.track ? `${form.track} · ${form.track === "MMB" ? "3" : "4"} days` : "MMB · 3 days / EB · 4 days"}</dd></div><div><dt>HOST</dt><dd>LC Thyna</dd></div><div><dt>VENUE</dt><dd>Amir Palace</dd></div></dl></aside>
        <section className="dossier-panel" aria-labelledby="registration-title">
          <div className="dossier-heading"><p>{stage === "receipt" ? "DELEGATE RECEIPT / RECORD CONFIRMED" : `REGISTRATION RECORD / STEP ${stage} OF 3`}</p><h2 id="registration-title">{heading}</h2><span /></div>
          {stage !== "receipt" && <div className="dossier-progress" aria-label={`Registration step ${stage} of 3`}><span className={progressClass(1)}><b>01</b><i>Information</i></span><em /><span className={progressClass(2)}><b>02</b><i>Participation</i></span><em /><span className={progressClass(3)}><b>03</b><i>Review</i></span></div>}
          {stage === "receipt" && receipt ? <section className="registration-receipt" aria-live="polite"><div className="receipt-seal">✓</div><p className="receipt-kicker">REGISTRATION RECEIVED</p><h3>Thank you, {receipt.form.firstName}.</h3><p className="receipt-copy">Your Lead &amp; Lead 2K26 registration has been recorded.</p><div className="receipt-reference"><span>REFERENCE</span><strong>{receipt.reference}</strong><small>RECORDED {receipt.recordedAt}</small></div><div className="receipt-summary"><div><span>PARTICIPATION</span><strong>{receipt.form.nationality} · {receipt.form.track} · {receipt.form.position}</strong></div><div><span>CONTRIBUTION</span><strong>{receipt.price} {receipt.currency}</strong></div><div><span>DOCUMENTS</span><strong>{Object.keys(receipt.documents).length} uploaded</strong></div><div className="receipt-document-links" aria-label="Uploaded document links">{Object.entries(receipt.documents).map(([key, document]) => document ? <a key={key} href={document.url} target="_blank" rel="noreferrer">{key === "identity" ? "CIN / passport" : key === "photo" ? "Profile photo" : "CV / résumé"} ↗</a> : null)}</div><div><span>ROOM</span><strong>{receipt.form.singleRoom ? "Single · 80 TND / per night" : "Shared"}</strong></div></div><p className="receipt-next-step">Keep this reference for the organising team. Your place is subject to the event team’s confirmation.</p><button className="bronze-button receipt-home" type="button" onClick={() => isEmbedded ? window.parent.postMessage({ type: "lead-lead-registration-close" }, window.location.origin) : window.location.assign("/home")}>{isEmbedded ? "CLOSE REGISTRATION" : "RETURN TO THE GATHERING"} <b>→</b></button></section> : <form onSubmit={submit} noValidate>
            {stage === 1 && <div className="registration-step registration-step--information"><p className="step-intro">Use your official details so the organising team can identify your registration.</p><div className="form-grid two"><label>First name<input value={form.firstName} onChange={(event) => update("firstName", event.target.value)} placeholder="Foulen" required aria-invalid={Boolean(errors.firstName)} />{error("firstName")}</label><label>Last name<input value={form.lastName} onChange={(event) => update("lastName", event.target.value)} placeholder="Fouléni" required aria-invalid={Boolean(errors.lastName)} />{error("lastName")}</label></div><div className="form-grid two"><label>CIN number<input value={form.cin} onChange={(event) => update("cin", event.target.value)} placeholder="Keep as text" required aria-invalid={Boolean(errors.cin)} />{error("cin")}</label><label>Local committee<select required value={form.lc} onChange={(event) => update("lc", event.target.value)}>{lcs.map((lc) => <option key={lc}>{lc}</option>)}</select>{error("lc")}</label></div><div className="form-grid two"><label>Country code<select value={form.phoneCountry} onChange={(event) => update("phoneCountry", event.target.value)} required aria-invalid={Boolean(errors.phoneCountry)}>{phoneCountries.map(([code, country]) => <option value={code} key={`${code}-${country}`}>{code} · {country}</option>)}</select>{error("phoneCountry")}</label><label>Phone number<input value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="55 555 555" inputMode="tel" required aria-invalid={Boolean(errors.phone)} />{error("phone")}</label><label>Email<input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="foulen.fouleni@mail.com" autoComplete="email" required aria-invalid={Boolean(errors.email)} />{error("email")}</label></div><button className="bronze-button submit-button" type="button" onClick={continueToParticipation}>CONTINUE <b>→</b></button></div>}
            {stage === 2 && <div className="registration-step registration-step--participation"><p className="step-intro">Select your participation package and complete the delegate record.</p>{fee ? <div className="contribution-card"><p>YOUR CONTRIBUTION</p><strong>{fee.price} <small>{fee.currency}</small></strong><span>{fee.note} Payment is not collected through this page.</span></div> : <div className="contribution-card contribution-card--pending"><p>CONTRIBUTION</p><span>Select nationality and track to reveal your contribution.</span></div>}<div className="form-grid two"><label>Nationality<select required value={form.nationality} onChange={(event) => { const nationality = event.target.value as Nationality; setForm((current) => ({ ...current, nationality, singleRoom: nationality === "Tounsi" ? current.singleRoom : false })); }} aria-invalid={Boolean(errors.nationality)}><option value="">Select nationality</option><option>Tounsi</option></select>{error("nationality")}</label><label>Track<select required value={form.track} onChange={(event) => update("track", event.target.value as Track)} aria-invalid={Boolean(errors.track)}><option value="">Select track</option><option>MMB</option><option>EB</option></select>{error("track")}</label><label>Position<select required value={form.position} onChange={(event) => update("position", event.target.value as Position)} aria-invalid={Boolean(errors.position)}><option value="">Select position</option><option>Manager</option><option>Team Leader</option><option>LCVP</option><option>LCP</option></select>{error("position")}</label></div>{form.nationality && form.track && <label className="single-room-option"><input type="checkbox" checked={form.singleRoom} onChange={(event) => update("singleRoom", event.target.checked)} /><span><strong>Single room</strong><small>Accommodation is 80 TND / per night.</small></span></label>}<label>Department<select required value={form.department} onChange={(event) => update("department", event.target.value)} aria-invalid={Boolean(errors.department)}><option value="">Select your department</option>{departments.map((department) => <option key={department}>{department}</option>)}</select>{error("department")}</label><div className="attachment-grid"><label className="attachment-field attachment-field--identity">CIN / passport <small>Required · JPG, PNG, or PDF · max 5 MB</small><input type="file" accept="image/jpeg,image/png,application/pdf,.pdf" required onChange={(event) => selectAttachment("identity", event.target.files?.[0])} />{attachments.identity && <strong>{attachments.identity.name}<button type="button" onClick={() => removeAttachment("identity")}>REMOVE</button></strong>}{attachmentErrors.identity && <small className="field-error" role="alert">{attachmentErrors.identity}</small>}</label><label className="attachment-field">Profile photo <small>Required · JPG, PNG, or WebP · max 3 MB</small><input type="file" accept="image/jpeg,image/png,image/webp" required onChange={(event) => selectAttachment("photo", event.target.files?.[0])} />{attachments.photo && <strong>{attachments.photo.name}<button type="button" onClick={() => removeAttachment("photo")}>REMOVE</button></strong>}{attachmentErrors.photo && <small className="field-error" role="alert">{attachmentErrors.photo}</small>}</label><label className="attachment-field">CV / résumé <small>Required · PDF · max 5 MB</small><input type="file" accept="application/pdf,.pdf" required onChange={(event) => selectAttachment("cv", event.target.files?.[0])} />{attachments.cv && <strong>{attachments.cv.name}<button type="button" onClick={() => removeAttachment("cv")}>REMOVE</button></strong>}{attachmentErrors.cv && <small className="field-error" role="alert">{attachmentErrors.cv}</small>}</label></div><label>Allergies <small>Required · enter “None” if not applicable</small><textarea value={form.allergies} onChange={(event) => update("allergies", event.target.value)} rows={3} placeholder="List allergies or dietary concerns, or enter None" required aria-invalid={Boolean(errors.allergies)} />{error("allergies")}</label><label>Additional note <small>Required · enter “None” if not applicable</small><textarea value={form.note} onChange={(event) => update("note", event.target.value)} rows={3} placeholder="Add a note for the organising team, or enter None" required aria-invalid={Boolean(errors.note)} />{error("note")}</label><div className="registration-actions"><button className="step-back-button" type="button" onClick={() => goTo(1)}>← BACK</button><button className="bronze-button" type="button" onClick={continueToReview}>REVIEW <b>→</b></button></div></div>}
            {stage === 3 && <div className="registration-step registration-review"><p className="step-intro">Review your information before sending it to the organising team. A receipt appears only after the registration sheet confirms your record.</p><div className="review-grid"><section className="review-section"><h4>Delegate</h4><p>{form.firstName} {form.lastName}</p><p>{form.lc}</p><p>{form.email}</p></section><section className="review-section"><h4>Participation</h4><p>{form.nationality || "Nationality pending"} / {form.track || "Track pending"} / {form.position || "Position pending"}</p><p>{form.department || "Department pending"}</p><p>{form.singleRoom ? "Single room · 80 TND / per night" : "Shared room"}</p></section></div><div className="registration-actions"><button className="step-back-button" type="button" onClick={() => goTo(2)}>← BACK</button><button className="bronze-button" disabled={status === "sending" || uploadDocuments.isPending || submitRegistration.isPending} type="submit">{status === "sending" || uploadDocuments.isPending || submitRegistration.isPending ? "RECORDING…" : "SUBMIT REGISTRATION"}<b>→</b></button></div>{status === "sending" && <p className="form-status" role="status">Sending your registration to the organising team. Please keep this page open.</p>}{status === "upload" && <p className="form-status error" role="alert">An attachment could not be stored. Please check the file and try again.</p>}{status === "error" && <p className="form-status error" role="alert">The registration was not confirmed by the sheet. {submissionMessage} Your details remain on this page, so you can correct them and try again.</p>}</div>}
          </form>}
        </section>
      </div>
      {!isEmbedded && <ConferenceFooter />}
    </main>
  );
}
