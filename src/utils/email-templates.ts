import { createClient } from "@supabase/supabase-js";
import { config } from "@/env";

type EmailTemplateVariables = {
  email?: string;
  user_name?: string;
  [key: string]: string | undefined;
};

/**
 * Processes image tags: converts <img link="..."/> to <img src="..."/>
 * This allows users to use a simpler syntax for images
 */
export const processImageTags = (html: string): string => {
  // Match <img link="..." /> or <img link="..."/> with optional attributes
  const imgLinkRegex = /<img\s+([^>]*?)link\s*=\s*["']([^"']+)["']([^>]*?)\/?>/gi;
  
  return html.replace(imgLinkRegex, (match, before, linkUrl, after) => {
    // Remove the link attribute and add src attribute
    const cleanedBefore = before.replace(/\s+/g, " ").trim();
    const cleanedAfter = after.replace(/\s+/g, " ").trim();
    
    // Build the new img tag with src instead of link
    let newTag = "<img";
    if (cleanedBefore) {
      newTag += ` ${cleanedBefore}`;
    }
    newTag += ` src="${linkUrl}"`;
    if (cleanedAfter) {
      newTag += ` ${cleanedAfter}`;
    }
    newTag += ">";
    
    return newTag;
  });
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
 * Gets default email templates (fallback)
 */
export const getDefaultEmailTemplate = (
  slug: string
): { subject: string; html_content: string } | null => {
  const defaultTemplates: Record<
    string,
    { subject: string; html_content: string }
  > = {
    "participant-accepted": {
      subject: "Your Participant Application Has Been Accepted",
      html_content: `<h1>Hello {{email}}</h1>
        <p>Congratulations! Your application to become a GLUE participant has been accepted.</p>
        <p>You can now start modifying your participant data and creating events.</p>
        <p>Log in to your account to get started!</p>`,
    },
    "participant-reactivated": {
      subject: "Your GLUE Account Has Been Reactivated",
      html_content: `<h1>Welcome back, {{user_name}}!</h1>
        <p>Your GLUE account has been successfully reactivated.</p>
        <p>You now have full access to all features and can start creating events and interacting with the community.</p>
        <p>Log in to your account to get started!</p>`,
    },
    "upgrade-request-accepted": {
      subject: "Your Participant Application Has Been Accepted",
      html_content: `<h1>Hello {{email}}</h1>
        <p>Congratulations! Your application to become a GLUE participant has been accepted.</p>
        <p>You can now start modifying your participant data and creating events.</p>
        <p>Log in to your account to get started!</p>`,
    },
  };

  return defaultTemplates[slug] || null;
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
