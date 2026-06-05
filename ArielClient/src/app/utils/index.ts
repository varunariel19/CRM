import { Script, scripts } from "../core/constants/ai";

export function bindPromptScript(script: Script) {
  return scripts[script].generatePrompt;
}
