interface ForgotPasswordTemplateParams {
  userName: string;
  resetLink: string;
  expiryMinute?: number;
  supportEmail?: string;
}

export function generateForgotPasswordTemplate(params: ForgotPasswordTemplateParams): string {
  const {
    userName,
    resetLink,
    expiryMinute,
  } = params;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .container {
            background-color: #f9f9f9;
            padding: 30px;
            border-radius: 8px;
            border: 1px solid #ddd;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin: 20px 0;
        }
        .footer {
            margin-top: 30px;
            font-size: 14px;
            color: #666;
        }
        .warning {
            color: #d9534f;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Password Reset Request</h2>
        
        <p>Hello ${userName},</p>
        
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        
        <div style="text-align: center;">
            <a href="${resetLink}" class="button">Reset Your Password</a>
        </div>
        
        <p class="warning">
            <strong>Important:</strong> This link will expire in ${expiryMinute} hours. 
            If you didn't request this reset, please ignore this email.
        </p>
        
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p>${resetLink}</p>
        
        <div class="footer">

            <p>&copy; ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
  `.trim();
}