const FROM_EMAIL = process.env.FROM_EMAIL || "onboarding@resend.dev";
const REPLY_TO = process.env.REPLY_TO_EMAIL || "contact@nikychemical.com";

export interface TrainingConfirmationEmailData {
  studentName: string;
  studentEmail: string;
  registrationNumber: string;
  trainingTitle: string;
  trainingMode: string;
  trainingLocation: string;
  amount: number;
  paymentMethod: string;
  moncashReference?: string;
}

function buildEmailHtml(data: TrainingConfirmationEmailData): string {
  const paymentLabel =
    data.paymentMethod === "moncash" ? "MonCash (Mobile)" : "Sur place au centre";

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Confirmation d'inscription NAF</title>
</head>
<body style="margin:0;padding:0;background:#f4f6fa;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fa;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a3c5e 0%,#2563eb 100%);padding:36px 40px;text-align:center;">
              <div style="font-size:13px;font-weight:700;color:#93c5fd;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">
                Niky Académie de Formation
              </div>
              <h1 style="margin:0;font-size:26px;font-weight:800;color:#ffffff;line-height:1.3;">
                ✅ Paiement Confirmé !
              </h1>
              <p style="margin:10px 0 0;font-size:14px;color:#bfdbfe;">
                Votre inscription a été validée avec succès.
              </p>
            </td>
          </tr>

          <!-- Welcome Banner -->
          <tr>
            <td style="background:#eff6ff;border-bottom:2px solid #bfdbfe;padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:15px;color:#1e40af;font-weight:600;">
                Bienvenue, <strong>${data.studentName}</strong> 👋
              </p>
              <p style="margin:6px 0 0;font-size:13px;color:#3b82f6;">
                Votre dossier étudiant NAF a été enregistré et votre paiement reçu.
              </p>
            </td>
          </tr>

          <!-- Dossier Code -->
          <tr>
            <td style="padding:32px 40px 8px;text-align:center;">
              <div style="display:inline-block;background:#f0fdf4;border:2px solid #86efac;border-radius:14px;padding:20px 32px;">
                <div style="font-size:11px;font-weight:700;color:#16a34a;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">
                  Numéro de Dossier Étudiant
                </div>
                <div style="font-size:28px;font-weight:900;color:#15803d;font-family:'Courier New',monospace;letter-spacing:2px;">
                  ${data.registrationNumber}
                </div>
                <div style="font-size:11px;color:#4ade80;margin-top:4px;">
                  Conservez ce code — il est votre référence officielle NAF
                </div>
              </div>
            </td>
          </tr>

          <!-- Details -->
          <tr>
            <td style="padding:24px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
                <tr style="background:#f8fafc;">
                  <td style="padding:10px 18px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;" colspan="2">
                    Détails de la Formation
                  </td>
                </tr>
                <tr style="border-top:1px solid #e2e8f0;">
                  <td style="padding:12px 18px;font-size:13px;color:#64748b;width:45%;">Formation</td>
                  <td style="padding:12px 18px;font-size:13px;font-weight:600;color:#0f172a;text-align:right;">${data.trainingTitle}</td>
                </tr>
                <tr style="border-top:1px solid #e2e8f0;background:#fafafa;">
                  <td style="padding:12px 18px;font-size:13px;color:#64748b;">Mode</td>
                  <td style="padding:12px 18px;font-size:13px;font-weight:600;color:#0f172a;text-align:right;">${data.trainingMode}</td>
                </tr>
                <tr style="border-top:1px solid #e2e8f0;">
                  <td style="padding:12px 18px;font-size:13px;color:#64748b;">Lieu</td>
                  <td style="padding:12px 18px;font-size:13px;font-weight:600;color:#0f172a;text-align:right;">${data.trainingLocation}</td>
                </tr>
                <tr style="border-top:1px solid #e2e8f0;background:#fafafa;">
                  <td style="padding:12px 18px;font-size:13px;color:#64748b;">Montant payé</td>
                  <td style="padding:12px 18px;font-size:15px;font-weight:900;color:#2563eb;text-align:right;">${Number(data.amount).toLocaleString("fr-HT")} HTG</td>
                </tr>
                <tr style="border-top:1px solid #e2e8f0;">
                  <td style="padding:12px 18px;font-size:13px;color:#64748b;">Mode de paiement</td>
                  <td style="padding:12px 18px;font-size:13px;font-weight:600;color:#0f172a;text-align:right;">${paymentLabel}</td>
                </tr>
                ${
                  data.moncashReference
                    ? `<tr style="border-top:1px solid #e2e8f0;background:#fafafa;">
                  <td style="padding:12px 18px;font-size:13px;color:#64748b;">Référence MonCash</td>
                  <td style="padding:12px 18px;font-size:12px;font-weight:700;color:#7c3aed;font-family:monospace;text-align:right;">${data.moncashReference}</td>
                </tr>`
                    : ""
                }
              </table>
            </td>
          </tr>

          <!-- Next Steps -->
          <tr>
            <td style="padding:0 40px 24px;">
              <div style="background:#fef9c3;border:1px solid #fde047;border-radius:12px;padding:18px 20px;">
                <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#854d0e;">📋 Prochaines étapes :</p>
                <ul style="margin:0;padding-left:18px;font-size:12px;color:#713f12;line-height:1.9;">
                  <li>Présentez-vous à notre centre le jour de la formation.</li>
                  <li>Munissez-vous de votre pièce d'identité et de ce numéro de dossier.</li>
                  <li>Port des équipements de protection individuelle (EPI) obligatoire en lab.</li>
                  <li>Pour toute question : <strong>+509 47 29 76 55</strong></li>
                </ul>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#1e293b;padding:24px 40px;text-align:center;">
              <p style="margin:0;font-size:13px;font-weight:700;color:#e2e8f0;">Niky Académie de Formation (NAF)</p>
              <p style="margin:6px 0 0;font-size:11px;color:#94a3b8;">68b Route De Frère Pétion-Ville, Haïti • +509 47 29 76 55</p>
              <p style="margin:8px 0 0;font-size:11px;color:#475569;">© ${new Date().getFullYear()} Niky Académie de Formation. Tous droits réservés.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export async function sendTrainingConfirmationEmail(
  data: TrainingConfirmationEmailData
): Promise<{ success: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re_build_placeholder_key") {
    console.warn("RESEND_API_KEY is not configured, skipping confirmation email.");
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  if (!data.studentEmail) {
    console.warn("No student email provided, skipping confirmation email.");
    return { success: false, error: "No email address" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [data.studentEmail],
        reply_to: REPLY_TO,
        subject: `✅ Confirmation NAF — ${data.registrationNumber} | ${data.trainingTitle}`,
        html: buildEmailHtml(data),
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error("Resend API error:", errData);
      return { success: false, error: JSON.stringify(errData) };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Email send failed";
    console.error("Email send exception:", message);
    return { success: false, error: message };
  }
}
