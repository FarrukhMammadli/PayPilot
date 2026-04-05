// AIService.ts - Gemini AI Chat Integration
import { supabase } from '../lib/supabase';

interface AIPaymentResponse {
    type: 'payment_request';
    merchant: string;
    category: string;
    amount: number;
    currency: string;
    card_hint?: string;
    confirmation_text: string;
}

interface AIMessageResponse {
    type: 'message';
    text: string;
}

export type AIResponse = AIPaymentResponse | AIMessageResponse;

export interface AIChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}

export class AIService {
    // Hardcoded Edge Function URL for reliability
    private static readonly FUNCTION_URL = 'https://yogtzppngpirrsywsxne.supabase.co/functions/v1/ai-chat';

    /**
     * Send a text message to the AI and get a structured response
     */
    static async chat(text: string, history: AIChatMessage[] = []): Promise<AIResponse> {
        try {
            const url = this.FUNCTION_URL;
            const { data: { session } } = await supabase.auth.getSession();

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': session ? `Bearer ${session.access_token}` : '',
                },
                body: JSON.stringify({ text, history }),
            });

            if (response.status === 401) {
                return { type: 'message', text: 'Sessiyanız bitib. Zəhmət olmasa yenidən giriş edin.' };
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('AIService error status:', response.status, errorData);
                throw new Error(`AI request failed: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('AIService.chat error:', error);
            return {
                type: 'message',
                text: 'Bağlantı xətası. İnterneti və ya girişi yoxlayın.',
            };
        }
    }

    /**
     * Send an audio message to the AI (for voice commands)
     */
    static async chatWithAudio(audioBase64: string, mimeType: string = 'audio/mp4', history: AIChatMessage[] = []): Promise<AIResponse> {
        try {
            const url = this.FUNCTION_URL;
            const { data: { session } } = await supabase.auth.getSession();

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': session ? `Bearer ${session.access_token}` : '',
                },
                body: JSON.stringify({ audio: audioBase64, mimeType, history }),
            });

            if (response.status === 401) {
                return { type: 'message', text: 'Sessiyanız bitib. Yenidən giriş edin.' };
            }

            if (!response.ok) {
                throw new Error(`AI audio request failed: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('AIService.chatWithAudio error:', error);
            return {
                type: 'message',
                text: 'Səs analizi uğursuz oldu. Yenidən cəhd edin.',
            };
        }
    }
}
