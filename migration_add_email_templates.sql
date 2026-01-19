-- Migration: Add email_templates table
-- Date: 2024
-- Description: Creates a table to store customizable email templates for participant-related emails

-- Create the email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  subject VARCHAR(500) NOT NULL,
  html_content TEXT NOT NULL,
  description VARCHAR(500) NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_templates_slug ON email_templates(slug);

-- Add comments to document the table and columns
COMMENT ON TABLE email_templates IS 'Stores customizable email templates for participant-related notifications';
COMMENT ON COLUMN email_templates.slug IS 'Unique identifier for the email template (e.g., participant-accepted, participant-reactivated, upgrade-request-accepted)';
COMMENT ON COLUMN email_templates.subject IS 'Email subject line';
COMMENT ON COLUMN email_templates.html_content IS 'HTML content of the email template';
COMMENT ON COLUMN email_templates.description IS 'Human-readable description of when this email is sent';

-- Insert default templates
INSERT INTO email_templates (slug, subject, html_content, description)
VALUES 
  (
    'participant-accepted',
    'Your Participant Application Has Been Accepted',
    '<h1>Hello {{email}}</h1><p>Congratulations! Your application to become a GLUE participant has been accepted.</p><p>You can now start modifying your participant data and creating events.</p><p>Log in to your account to get started!</p>',
    'Sent when a participant application is accepted'
  ),
  (
    'participant-reactivated',
    'Your GLUE Account Has Been Reactivated',
    '<h1>Welcome back, {{user_name}}!</h1><p>Your GLUE account has been successfully reactivated.</p><p>You now have full access to all features and can start creating events and interacting with the community.</p><p>Log in to your account to get started!</p>',
    'Sent when a participant account is reactivated'
  ),
  (
    'upgrade-request-accepted',
    'Your Participant Application Has Been Accepted',
    '<h1>Hello {{email}}</h1><p>Congratulations! Your application to become a GLUE participant has been accepted.</p><p>You can now start modifying your participant data and creating events.</p><p>Log in to your account to get started!</p>',
    'Sent when a user''s upgrade request to become a participant is accepted'
  )
ON CONFLICT (slug) DO NOTHING;
