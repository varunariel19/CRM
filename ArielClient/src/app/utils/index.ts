import { Script, scripts } from "../core/constants/ai";

export function bindPromptScript(script: Script) {
  return scripts[script].generatePrompt;
}


export function   getAvatarColor(name: string | undefined): string {
  if (!name) return '#6b7280';

 const colors = [
      '#1565c0', '#6d28d9', '#0891b2', '#065f46',
      '#92400e', '#be185d', '#1d4ed8', '#7c3aed',
    ];

  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}