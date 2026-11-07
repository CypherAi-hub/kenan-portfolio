import type { Metadata } from "next";
import StudioHeader from "@/components/studio/StudioHeader";
import StudioFooter from "@/components/studio/StudioFooter";
export const metadata: Metadata = {
  title: "Privacy",
  description:
    "How KJL Designs handles portfolio, client workspace, payment, and Google connection data.",
};
export default function Privacy() {
  return (
    <div className="studio">
      <StudioHeader />
      <main
        className="studio-shell"
        style={{ maxWidth: 850, paddingTop: 150, paddingBottom: 100, lineHeight: 1.8 }}
      >
        <p>Updated November 7, 2026</p>
        <h1 style={{ fontSize: "clamp(2.6rem, 7vw, 4.5rem)", lineHeight: 1.1, marginBottom: 32 }}>
          Privacy at KJL Designs
        </h1>
        <p>
          KJL Designs is Kenan Larry’s design and development studio. This notice explains data used
          by this portfolio and its invitation-only client workspace.
        </p>
        <h2>Client workspace</h2>
        <p>
          We store names, email addresses, passkey public credentials, session records, project
          briefs, updates, feedback, appointment requests, and payment status to operate client
          projects. Private workspace records are stored with Vercel Blob. Clients can access their
          own workspace; the studio owner manages studio records. Passkey private keys stay with
          your authenticator.
        </p>
        <h2>Payments and booking</h2>
        <p>
          Stripe hosts payment checkout and processes payment details under its privacy policy. The
          studio stores payment request amounts, checkout references, and payment confirmation
          status, rather than card numbers. The public booking page uses Google Calendar’s booking
          service.
        </p>
        <h2>Private project connections</h2>
        <p>
          The owner’s project review tools can read limited project counts and basic account
          directory records from connected FoFit, UltraFlips and General Services sources. Account
          records include names, email addresses and account dates where available. Separate
          read-only connections exclude passwords, tokens, health details, payment details, private
          files and request attachments. Clients cannot access these tools.
        </p>
        <p>
          Meridian Atlas uses a dated local count snapshot. HireCrate uses an owner-imported backup
          snapshot. Imported contact fields are limited to identity, email and status; private notes
          and detailed job records are excluded. These snapshots do not update automatically. The
          assistant may send requested project evidence and saved screenshots to OpenAI for
          assessment. Private account records are requested separately by the owner.
        </p>
        <h2>Google email and Calendar connection</h2>
        <p>
          The owner can connect their Google account through Vercel Connect. The connection requests
          account identity, permission to send Gmail messages, manage events on owned calendars, and
          check Calendar availability. The studio currently uses the primary calendar for
          availability and event creation. It does not request permission to read Gmail inbox
          messages. The owner reviews each proposed recipient, message, or calendar invitation
          before approving an external action. When Google is connected, combined meeting approval
          prepares a Calendar invitation for owner review before approving the portal request. A
          separately labeled portal-only approval reserves time only in the workspace.
        </p>
        <p>
          Google tokens are managed by Vercel Connect and used by server code. They are not returned
          to the browser or placed in AI prompts. Disconnect access at any time in{" "}
          <a href="https://myaccount.google.com/connections" target="_blank" rel="noreferrer">
            your Google account’s connections
          </a>
          . Disconnecting does not remove messages already sent or existing Calendar events. KJL
          Designs’ use and transfer of information received from Google APIs adheres to the{" "}
          <a
            href="https://developers.google.com/terms/api-services-user-data-policy"
            target="_blank"
            rel="noreferrer"
          >
            Google API Services User Data Policy
          </a>
          , including its Limited Use requirements.
        </p>
        <h2>Private studio assistant</h2>
        <p>
          Recent assistant conversations and action reviews are saved in private studio storage. The
          owner assistant sends the owner’s request, recent conversation, and relevant client
          project and delivery records to OpenAI to generate replies and proposed actions. Requests
          use the API’s store:false setting. Do not include passwords, payment credentials, or
          unnecessary sensitive information in project notes. The assistant prepares changes for
          owner review. It cannot grant account access or directly charge a saved card.
        </p>
        <h2>Service providers and website metrics</h2>
        <p>
          Vercel provides hosting, private storage, and connection infrastructure; Stripe processes
          checkout; Google provides connected email and Calendar services; OpenAI provides assistant
          responses. The public portfolio uses Vercel Analytics and Speed Insights. Private portal
          pages do not load those analytics components. Service providers may process data under
          their own service policies.
        </p>
        <h2>Data questions</h2>
        <p>
          Records are retained to operate projects and keep delivery and payment history. For
          access, corrections, or deletion questions, contact{" "}
          <a href="mailto:kenanlarry8@gmail.com">kenanlarry8@gmail.com</a>. Some records may need to
          remain for ongoing work, payment reconciliation, or applicable recordkeeping requirements.
        </p>
      </main>
      <StudioFooter />
    </div>
  );
}
