import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';

const EMAIL_TEMPLATES_DIR = path.dirname(fileURLToPath(import.meta.url));

export interface EmailTemplateData {
  subject: string;
  html: string;
  text: string;
}

function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<p[^>]*>/gi, '\n\n')
    .replace(/<\/p>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function loadEmailTemplate(
  templateName: string,
  variables: Record<string, string> = {}
): EmailTemplateData {
  const templatePath = path.join(EMAIL_TEMPLATES_DIR, `${templateName}.html`);
  
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Email template not found: ${templateName}`);
  }

  let html = fs.readFileSync(templatePath, 'utf-8');
  
  // Replace %VARIABLE% syntax
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`%${key.toUpperCase()}%`, 'g');
    html = html.replace(regex, value);
  }

  // Extract subject from title tag or use default
  const subjectMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const subject = subjectMatch ? subjectMatch[1] : 'BA Protege+';
  
  // Also replace in subject
  let finalSubject = subject;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`%${key.toUpperCase()}%`, 'g');
    finalSubject = finalSubject.replace(regex, value);
  }

  const text = htmlToText(html);

  return {
    subject: finalSubject,
    html,
    text,
  };
}

export function getWelcomeEmail(variables: {
  displayName: string;
  link: string;
}) {
  return loadEmailTemplate('email-welcome', {
    DISPLAY_NAME: variables.displayName,
    LINK: variables.link,
  });
}

export function getDeviceLinkedEmail(variables: {
  displayName: string;
  protectedName: string;
  link: string;
}) {
  return loadEmailTemplate('email-device-linked', {
    DISPLAY_NAME: variables.displayName,
    PROTECTED_NAME: variables.protectedName,
    LINK: variables.link,
  });
}

export function getBlockedSiteAlertEmail(variables: {
  displayName: string;
  protectedName: string;
  link: string;
}) {
  return loadEmailTemplate('email-blocked-site-alert', {
    DISPLAY_NAME: variables.displayName,
    PROTECTED_NAME: variables.protectedName,
    LINK: variables.link,
  });
}

export function getCustomBlockedSiteAlertEmail(variables: {
  displayName: string;
  protectedName: string;
  link: string;
}) {
  return loadEmailTemplate('email-custom-blocked-site-alert', {
    DISPLAY_NAME: variables.displayName,
    PROTECTED_NAME: variables.protectedName,
    LINK: variables.link,
  });
}

export function getBlockedAppAlertEmail(variables: {
  displayName: string;
  protectedName: string;
  appName: string;
  link: string;
}) {
  return loadEmailTemplate('email-blocked-app-alert', {
    DISPLAY_NAME: variables.displayName,
    PROTECTED_NAME: variables.protectedName,
    BLOCKED_APP_NAME: variables.appName,
    LINK: variables.link,
  });
}

export function getPermissionDisabledAlertEmail(variables: {
  displayName: string;
  protectedName: string;
  permissionName: string;
  link: string;
}) {
  return loadEmailTemplate('email-permission-disabled-alert', {
    DISPLAY_NAME: variables.displayName,
    PROTECTED_NAME: variables.protectedName,
    PERMISSION_NAME: variables.permissionName,
    LINK: variables.link,
  });
}

export function getUninstallAttemptAlertEmail(variables: {
  displayName: string;
  protectedName: string;
  link: string;
}) {
  return loadEmailTemplate('email-uninstall-attempt-alert', {
    DISPLAY_NAME: variables.displayName,
    PROTECTED_NAME: variables.protectedName,
    LINK: variables.link,
  });
}

export function getSelfProtectionSiteReminderEmail(variables: {
  displayName: string;
  siteName: string;
  link: string;
}) {
  return loadEmailTemplate('email-self-protection-site-reminder', {
    DISPLAY_NAME: variables.displayName,
    SITE_NAME: variables.siteName,
    LINK: variables.link,
  });
}

export function getSelfProtectionAppLimitEmail(variables: {
  displayName: string;
  appName: string;
  link: string;
}) {
  return loadEmailTemplate('email-self-protection-app-limit', {
    DISPLAY_NAME: variables.displayName,
    LIMITED_APP_NAME: variables.appName,
    LINK: variables.link,
  });
}

export function getAdultProtectedSiteReminderEmail(variables: {
  displayName: string;
  siteName: string;
  link: string;
}) {
  return loadEmailTemplate('email-adult-protected-site-reminder', {
    DISPLAY_NAME: variables.displayName,
    SITE_NAME: variables.siteName,
    LINK: variables.link,
  });
}

export function getAdultProtectedAppLimitEmail(variables: {
  displayName: string;
  appName: string;
  link: string;
}) {
  return loadEmailTemplate('email-adult-protected-app-limit', {
    DISPLAY_NAME: variables.displayName,
    LIMITED_APP_NAME: variables.appName,
    LINK: variables.link,
  });
}

export function getPasswordResetEmail(variables: {
  displayName: string;
  link: string;
}) {
  return loadEmailTemplate('email-password-reset', {
    DISPLAY_NAME: variables.displayName,
    LINK: variables.link,
  });
}