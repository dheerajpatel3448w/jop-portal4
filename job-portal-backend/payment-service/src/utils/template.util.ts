export function getApplicationStatusEmail(jobTitle:string) {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Application Status Update</title>
  </head>
  <body style="margin:0; padding:0; background:#f7f7f7; font-family:Arial, sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f7; padding:20px 0;">
      <tr>
        <td align="center">

          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:10px; padding:20px;">

            <tr>
              <td style="text-align:center; padding:10px 0;">
                <h2 style="margin:0; font-size:24px; color:#333333;">
                  Application Status Update
                </h2>
              </td>
            </tr>

            <tr>
              <td style="padding:10px 0; color:#555555; font-size:15px; line-height:1.6;">
                Dear Applicant,<br/><br/>

                This is to inform you that your application for the position of
                <strong>${jobTitle}</strong> has been successfully submitted and is now under review.<br/><br/>

                Our team will evaluate your profile and notify you about any further updates regarding your application status.<br/><br/>

                Thank you for showing interest and taking the time to apply.<br/><br/>

                Best regards,<br/>
                <strong>Team Support</strong>
              </td>
            </tr>

            <tr>
              <td style="text-align:center; padding:20px 0;">
                <a
                  href="#"
                  style="display:inline-block; background:#2563eb; color:#ffffff; padding:10px 20px; 
                  border-radius:6px; text-decoration:none; font-weight:bold; font-size:14px;">
                  View Application
                </a>
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
