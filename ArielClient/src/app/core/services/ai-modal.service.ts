import { Injectable } from '@angular/core';
import { bindPromptScript } from '../../utils';
import { Script } from '../constants/ai';
import { endpoints } from '../constants/endpoints';

@Injectable({
    providedIn: 'root',
})

export class AiService {

    async AiGeneratedResponse(modalName: Script, payload: string): Promise<string> {
        const key = endpoints.groqApiKey;
        const URL = endpoints.AIUrl;
        const modal = bindPromptScript(modalName);
        const promptContent = modal(payload);

        try {
            const response = await fetch(URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${key}`,
                },
                body: JSON.stringify({
                    model: 'llama-3.1-8b-instant',
                    messages: [{ role: 'user', content: promptContent }],
                    temperature: 0.5,
                    max_completion_tokens: 1024,
                }),
            });

            if (!response.ok) {
                return 'Service is currently unavailable. Please try again later.';
            }

            const data = await response.json();
            const botReply = data?.choices?.[0]?.message?.content;
            return botReply ?? 'Something went wrong. Please try again later.';
        } catch (err) {
            return 'Service is currently unavailable. Please try again later.';
        }
    }
}
