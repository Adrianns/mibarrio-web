export interface MonthlyStatsEmailData {
	providerName: string;
	monthName: string;
	year: number;
	viewsCount: number;
	clicksBreakdown: {
		phone: number;
		whatsapp: number;
		email: number;
		website: number;
		instagram: number;
		facebook: number;
	};
	profileUrl: string;
}

export function generateMonthlyStatsEmail(data: MonthlyStatsEmailData): string {
	const totalClicks = Object.values(data.clicksBreakdown).reduce((a, b) => a + b, 0);

	return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tu resumen mensual - Mi Barrio</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">Mi Barrio</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Tu resumen mensual</p>
            </td>
          </tr>

          <!-- Main content -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 8px; color: #1f2937; font-size: 20px; font-weight: 600;">Hola, ${data.providerName}!</h2>
              <p style="margin: 0 0 24px; color: #6b7280; font-size: 15px;">
                Estos son los resultados de tu perfil en <strong>${data.monthName} ${data.year}</strong>
              </p>

              <!-- Stats cards -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="48%" style="padding-right: 8px;">
                    <div style="background-color: #f0fdf4; border-radius: 12px; padding: 20px; text-align: center;">
                      <p style="margin: 0 0 4px; color: #166534; font-size: 32px; font-weight: 700;">${data.viewsCount}</p>
                      <p style="margin: 0; color: #15803d; font-size: 14px; font-weight: 500;">Visitas al perfil</p>
                    </div>
                  </td>
                  <td width="48%" style="padding-left: 8px;">
                    <div style="background-color: #eff6ff; border-radius: 12px; padding: 20px; text-align: center;">
                      <p style="margin: 0 0 4px; color: #1e40af; font-size: 32px; font-weight: 700;">${totalClicks}</p>
                      <p style="margin: 0; color: #1d4ed8; font-size: 14px; font-weight: 500;">Clicks de contacto</p>
                    </div>
                  </td>
                </tr>
              </table>

              ${
								totalClicks > 0
									? `
              <!-- Clicks breakdown -->
              <div style="margin-top: 24px; padding: 20px; background-color: #f9fafb; border-radius: 12px;">
                <h3 style="margin: 0 0 16px; color: #374151; font-size: 16px; font-weight: 600;">Desglose de clicks</h3>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  ${data.clicksBreakdown.phone > 0 ? `<tr><td style="padding: 6px 0; color: #4b5563; font-size: 14px;">Teléfono</td><td style="padding: 6px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${data.clicksBreakdown.phone}</td></tr>` : ''}
                  ${data.clicksBreakdown.whatsapp > 0 ? `<tr><td style="padding: 6px 0; color: #4b5563; font-size: 14px;">WhatsApp</td><td style="padding: 6px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${data.clicksBreakdown.whatsapp}</td></tr>` : ''}
                  ${data.clicksBreakdown.email > 0 ? `<tr><td style="padding: 6px 0; color: #4b5563; font-size: 14px;">Email</td><td style="padding: 6px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${data.clicksBreakdown.email}</td></tr>` : ''}
                  ${data.clicksBreakdown.website > 0 ? `<tr><td style="padding: 6px 0; color: #4b5563; font-size: 14px;">Sitio web</td><td style="padding: 6px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${data.clicksBreakdown.website}</td></tr>` : ''}
                  ${data.clicksBreakdown.instagram > 0 ? `<tr><td style="padding: 6px 0; color: #4b5563; font-size: 14px;">Instagram</td><td style="padding: 6px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${data.clicksBreakdown.instagram}</td></tr>` : ''}
                  ${data.clicksBreakdown.facebook > 0 ? `<tr><td style="padding: 6px 0; color: #4b5563; font-size: 14px;">Facebook</td><td style="padding: 6px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${data.clicksBreakdown.facebook}</td></tr>` : ''}
                </table>
              </div>
              `
									: ''
							}

              <!-- CTA -->
              <div style="margin-top: 32px; text-align: center;">
                <a href="${data.profileUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 600;">Ver mi perfil</a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 13px; text-align: center;">
                Este es un resumen automatico de tu actividad en Mi Barrio.<br>
                Si tienes alguna pregunta, respondenos a este email.
              </p>
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

export function generateMonthlyStatsSubject(monthName: string, year: number): string {
	return `Tu resumen de ${monthName} ${year} - Mi Barrio`;
}
