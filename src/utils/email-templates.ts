import { createClient } from "@supabase/supabase-js";
import { config } from "@/env";

type EmailTemplateVariables = {
  email?: string;
  user_name?: string;
  [key: string]: string | undefined;
};

/**
 * Processes image tags: converts <img link="..."/> to <img src="..."/>
 * If the image has clickable="true", wraps the image in an anchor tag
 * - If link attribute exists, uses it as the href
 * - If no link attribute, uses the image src as the href (links to itself)
 * This allows users to use a simpler syntax for images
 */
export const processImageTags = (html: string): string => {
  // Process all clickable images in one pass
  const imgClickableRegex = /<img\s+([^>]*?)clickable\s*=\s*["']true["']([^>]*?)\/?>/gi;
  
  let processed = html.replace(imgClickableRegex, (match, before, after) => {
    // Extract link and src attributes
    const linkMatch = before.match(/link\s*=\s*["']([^"']+)["']/) || after.match(/link\s*=\s*["']([^"']+)["']/);
    const srcMatch = before.match(/src\s*=\s*["']([^"']+)["']/) || after.match(/src\s*=\s*["']([^"']+)["']/);
    
    const linkUrl = linkMatch ? linkMatch[1] : null;
    const src = srcMatch ? srcMatch[1] : linkUrl; // Fallback to linkUrl if no src
    
    if (!src) {
      // No src or link found, return as-is (shouldn't happen)
      return match;
    }
    
    // If link equals src, it means redirect is unchecked (image links to itself)
    // Use src as href in this case
    const isRedirect = linkUrl && linkUrl !== src;
    const href = isRedirect ? linkUrl : src;
    
    // Remove clickable and link attributes
    const cleanedBefore = before.replace(/\s+/g, " ").trim();
    const cleanedAfter = after.replace(/\s+/g, " ").trim();
    
    const beforeWithoutAttrs = cleanedBefore
      .replace(/clickable\s*=\s*["'][^"']*["']/gi, "")
      .replace(/link\s*=\s*["'][^"']*["']/gi, "")
      .trim();
    const afterWithoutAttrs = cleanedAfter
      .replace(/clickable\s*=\s*["'][^"']*["']/gi, "")
      .replace(/link\s*=\s*["'][^"']*["']/gi, "")
      .trim();
    
    // Build the img tag
    let imgTag = "<img";
    if (beforeWithoutAttrs) {
      imgTag += ` ${beforeWithoutAttrs}`;
    }
    // Ensure src exists
    if (!beforeWithoutAttrs.includes('src=') && !afterWithoutAttrs.includes('src=')) {
      imgTag += ` src="${src}"`;
    }
    if (afterWithoutAttrs) {
      imgTag += ` ${afterWithoutAttrs}`;
    }
    imgTag += ">";
    
    // Use href (linkUrl if redirect, src if links to itself)
    return `<a href="${href}" target="_blank" rel="noopener noreferrer">${imgTag}</a>`;
  });
  
  // Handle images with link but no clickable (for backward compatibility, treat as non-clickable)
  // Match <img link="..." /> without clickable="true"
  const imgLinkRegex = /<img\s+([^>]*?)(?!clickable\s*=\s*["']true["'])link\s*=\s*["']([^"']+)["']([^>]*?)\/?>/gi;
  
  processed = processed.replace(imgLinkRegex, (match, before, linkUrl, after) => {
    // Remove the link attribute and add src attribute
    const cleanedBefore = before.replace(/\s+/g, " ").trim();
    const cleanedAfter = after.replace(/\s+/g, " ").trim();
    
    // Remove link attribute from the attributes string
    const beforeWithoutLink = cleanedBefore.replace(/link\s*=\s*["'][^"']*["']/gi, "").trim();
    const afterWithoutLink = cleanedAfter.replace(/link\s*=\s*["'][^"']*["']/gi, "").trim();
    
    // Build the img tag with src instead of link (NOT wrapped in anchor)
    let imgTag = "<img";
    if (beforeWithoutLink) {
      imgTag += ` ${beforeWithoutLink}`;
    }
    imgTag += ` src="${linkUrl}"`;
    if (afterWithoutLink) {
      imgTag += ` ${afterWithoutLink}`;
    }
    imgTag += ">";
    
    return imgTag;
  });
  
  return processed;
};

/**
 * Replaces template variables in HTML content
 * Variables should be in the format {{variableName}}
 */
export const replaceTemplateVariables = (
  template: string,
  variables: EmailTemplateVariables
): string => {
  let result = template;
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    result = result.replace(regex, value || "");
  });
  return result;
};

/**
 * Gets an email template from the database by slug
 * Falls back to default templates if not found in database
 */
export const getEmailTemplate = async (
  slug: string
): Promise<{ subject: string; html_content: string } | null> => {
  try {
    const supabase = createClient(
      config.supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { data, error } = await supabase
      .from("email_templates")
      .select("subject, html_content")
      .eq("slug", slug)
      .single();

    if (error || !data) {
      console.warn(
        `Email template with slug "${slug}" not found in database, using fallback`
      );
      return null;
    }

    return {
      subject: data.subject,
      html_content: data.html_content,
    };
  } catch (error) {
    console.error(`Error fetching email template "${slug}":`, error);
    return null;
  }
};

/**
 * Gets all default email templates with their metadata
 */
export const getAllDefaultEmailTemplates = (): Record<
  string,
  {
    subject: string;
    html_content: string;
    description: string;
  }
> => {
  return {
    "participant-accepted": {
      subject: "Your Participant Application Has Been Accepted",
      html_content: `<h1>Hello {{email}}</h1>
        <p>Congratulations! Your application to become a GLUE participant has been accepted.</p>
        <p>You can now start modifying your participant data and creating events.</p>
        <p>Log in to your account to get started!</p>`,
      description: "Sent when a participant application is accepted",
    },
    "participant-reactivated": {
      subject: "Your GLUE Account Has Been Reactivated",
      html_content: `<h1>Welcome back, {{user_name}}!</h1>
        <p>Your GLUE account has been successfully reactivated.</p>
        <p>You now have full access to all features and can start creating events and interacting with the community.</p>
        <p>Log in to your account to get started!</p>`,
      description: "Sent when a participant account is reactivated",
    },
    "upgrade-request-accepted": {
      subject: "Your Participant Application Has Been Accepted",
      html_content: `<h1>Hello {{email}}</h1>
        <p>Congratulations! Your application to become a GLUE participant has been accepted.</p>
        <p>You can now start modifying your participant data and creating events.</p>
        <p>Log in to your account to get started!</p>`,
      description:
        "Sent when a user's upgrade request to become a participant is accepted",
    },
    "participant-registration": {
      subject: "Your GLUE Participant Registration Has Been Received",
      html_content: `<h1>Hello {{user_name}}!</h1>
        <p>Thank you for registering as a GLUE participant!</p>
        <p>We have received your registration and a moderator will review your application shortly.</p>
        <p>You will receive an email notification once your application has been reviewed and approved.</p>
        <p>If you have any questions, please don't hesitate to contact us.</p>
        <p>Best regards,<br>The GLUE Team</p>`,
      description: "Sent when a new participant completes registration",
    },
  };
};

/**
 * Gets default email templates (fallback)
 */
export const getDefaultEmailTemplate = (
  slug: string
): { subject: string; html_content: string } | null => {
  const allTemplates = getAllDefaultEmailTemplates();
  const template = allTemplates[slug];
  if (!template) return null;
  
  return {
    subject: template.subject,
    html_content: template.html_content,
  };
};

/**
 * Gets email template with fallback to defaults
 */
export const getEmailTemplateWithFallback = async (
  slug: string
): Promise<{ subject: string; html_content: string }> => {
  const dbTemplate = await getEmailTemplate(slug);
  if (dbTemplate) {
    return dbTemplate;
  }

  const defaultTemplate = getDefaultEmailTemplate(slug);
  if (defaultTemplate) {
    return defaultTemplate;
  }

  throw new Error(`No email template found for slug: ${slug}`);
};

/**
 * Processes email template content: replaces variables and processes image tags
 */
export const processEmailTemplate = (
  htmlContent: string,
  variables: EmailTemplateVariables
): string => {
  // First replace variables
  let processed = replaceTemplateVariables(htmlContent, variables);
  // Then process image tags
  processed = processImageTags(processed);
  return processed;
};
