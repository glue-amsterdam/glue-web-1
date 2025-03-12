import { config } from "@/env";

export const sendDeclineReactivationEmail = (
  user_name: string,
  email: string
) => `
  <h1>Hello ${user_name || email},</h1>
  <p>We regret to inform you that your request to reactivate your GLUE account has been declined.</p>
  <p>If you believe this decision was made in error or if you have any questions, please don't hesitate to contact our support team.</p>
  <p>You can submit a new reactivation request with updated information if you wish to try again.</p>
`;

const baseParticipantAcceptedEmail = `<p>Congratulations! Your application to become a GLUE participant has been accepted.</p>
          <p>You can now start modifying your participant data and creating events.</p>
          <p>Log in to your account to get started!</p>`;

export const sendParticipantAcceptedEmail = (email: string) => `
          <h1>Hello ${email}</h1>
          ${(
            config.baseParticipantAcceptedEmail || baseParticipantAcceptedEmail
          ).replace(/\\n/g, "")}
        `;

export const sendReactivationApprovedEmail = (
  user_name: string,
  email: string
) => `
          <h1>Welcome back, ${user_name || email}!</h1>
          <p>Your GLUE account has been successfully reactivated.</p>
          <p>You now have full access to all features and can start creating events and interacting with the community.</p>
          <p>Log in to your account to get started!</p>
        `;
