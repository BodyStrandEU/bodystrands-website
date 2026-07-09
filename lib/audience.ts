import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Adds a contact to a Resend Segment (or attaches the segment to an existing
// contact). Never throws — capturing a subscriber or customer for later
// marketing is a side effect, not something that should break a newsletter
// signup or a checkout confirmation if Resend has a hiccup.
export async function addToAudience(
  segmentId: string | undefined,
  email: string,
  name?: string
): Promise<void> {
  if (!segmentId || !email) return;
  const [firstName, ...rest] = (name ?? "").trim().split(" ");

  try {
    const { error } = await resend.contacts.create({
      email,
      firstName: firstName || undefined,
      lastName: rest.join(" ") || undefined,
      unsubscribed: false,
      segments: [{ id: segmentId }],
    });
    if (error) throw error;
  } catch {
    // Contact likely already exists — just attach the segment to it.
    try {
      await resend.contacts.segments.add({ email, segmentId });
    } catch (e) {
      console.error(`Resend addToAudience(${segmentId}) failed for ${email}:`, e);
    }
  }
}
