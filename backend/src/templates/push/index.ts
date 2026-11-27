import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';

const TEMPLATES_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), 'templates.json');

let cachedTemplates: PushTemplates | null = null;

export interface PushTemplate {
  title: string;
  body: string;
  cta: string;
  data: Record<string, string>;
}

export interface PushTemplates {
  responsable: Record<string, PushTemplate>;
  protegido_mayor: Record<string, PushTemplate>;
}

export function loadPushTemplates(): PushTemplates {
  if (cachedTemplates) {
    return cachedTemplates;
  }

  const fileContent = fs.readFileSync(TEMPLATES_PATH, 'utf-8');
  cachedTemplates = JSON.parse(fileContent);
  return cachedTemplates!;
}

export function getPushTemplate(
  audience: 'responsable' | 'protegido_mayor',
  templateKey: string,
  variables: Record<string, string> = {}
): PushTemplate {
  const templates = loadPushTemplates();
  const template = templates[audience][templateKey];

  if (!template) {
    throw new Error(`Push template not found: ${audience}.${templateKey}`);
  }

  return {
    ...template,
    title: replaceVariables(template.title, variables),
    body: replaceVariables(template.body, variables),
  };
}

function replaceVariables(text: string, variables: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => variables[key] || match);
}

export function getResponsableTemplate(
  templateKey: string,
  variables: Record<string, string>
) {
  return getPushTemplate('responsable', templateKey, variables);
}

export function getProtegidoMayorTemplate(
  templateKey: string,
  variables: Record<string, string>
) {
  return getPushTemplate('protegido_mayor', templateKey, variables);
}