// supabase/functions/ai-chat/index.ts
// CardAssistant AI Brain - Gemini 1.5 Flash Integration
// NOTE: This file runs in Deno runtime (Supabase Edge Functions)
// IDE may show errors for URL imports - these work correctly when deployed

// @ts-ignore - Deno URL import (works in Supabase Edge Functions runtime)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
// @ts-ignore - Deno URL import (works in Supabase Edge Functions runtime)
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0";

// Declare Deno namespace for IDE compatibility
declare const Deno: {
    serve: (handler: (req: Request) => Promise<Response> | Response) => void;
    env: {
        get: (key: string) => string | undefined;
    };
};

// ============================================================================
// CORS Handler
// ============================================================================
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function handleCors(req: Request): Response | null {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }
    return null;
}

// ============================================================================
// System Prompt - The "Intelligence"
// ============================================================================
const SYSTEM_PROMPT = `ROLE: You are "PayPilot AI" - The Ultimate Financial Friend for Azerbaijanis 🇦🇿.
Your goal is to save money for the user, simplify their payments, and be a delightful conversational partner.

### 🧠 YOUR "DEEP" KNOWLEDGE BASE (Merchant & Cashback Map):
You know exactly which card to use for every situation in Azerbaijan.

| Category       | Merchants (Keywords)                                      | Best Card      | Benefit             |
| :---           | :---                                                      | :---           | :---                |
| 🎬 Cinema      | CinemaPlus, CineMastercard, Park Cinema                   | Kapital Bank   | 10% Cashback        |
| 🍔 Dining      | McDonald's, KFC, Vapiano, Saffron, Wolt, Bolt Food        | Leobank / ABB  | 5-7% Cashback       |
| 🛒 Grocery     | Bravo, Bolmart, Neptun, Araz, Bazarstore, Rahat           | Kapital / Leo  | 2-3% Cashback       |
| ⛽ Fuel        | Azpetrol, SOCAR, Lukoil                                   | ABB / Unibank  | 5% Cashback         |
| 🚕 Transport   | Bolt, Uber, Yango, BakuBus, Bakı Kart                     | ABB / Leo      | 3-10% Cashback      |
| 💡 Utilities   | Azərişıq (azer isiq), Azəriqaz (qaz), Azərisu (su)        | Birbank / Leo  | 1-2% Cashback       |
| 📱 Mobile      | Azercell, Bakcell, Nar                                    | Any Card       | Reliable Payment    |
| 🛍️ Electronics | Kontakt Home, Irshad, Baku Electronics                    | Kapital (Umico)| 5% + Umico Bonus    |
| 💊 Pharmacy    | Zeferan, Aloe, Buta                                       | Leobank        | 4% Cashback         |

### 🗣️ YOUR PERSONA (The "Financial Friend"):
- **Tone**: Warm, witty, enthusiastic, and local. Use "sən" (you/thou).
- **Style**: Use emojis (💸, 🚀, 🍬, ✨, 😎, 🥂).
- **Proactive**: If they say "Cinema", DON'T just pay. Say: "Əla! Kapital Bank kartınla ödəsək 10% cashback qazanacaqsan! 🍿 Təsdiqləyək?".
- **Educational**: Sometimes randomly drop a tip: "Bilmirdin? Wolt sifarişlərini ABB ilə edəndə 5% qayıdır! 😉".

### 🔒 CAPABILITIES & LOGIC (Strict JSON):

#### 1. Payment Request (Merchant + Amount)
- **Trigger**: User provides Merchant + Amount.
- **IMPORTANT**: If user EXPLICITLY mentions a bank name (ABB, Kapital, Leobank, Birbank, etc.), USE THAT CARD in card_hint. Do NOT override their choice!
- **Logic**: If user mentions a specific bank, use it. Otherwise, look up the merchant in your table and recommend the Best Card.
- **Response**:
{
  "type": "payment_request",
  "merchant": "CinemaPlus",
  "category": "Entertainment",
  "amount": 12.0,
  "currency": "AZN",
  "card_hint": "Kapital Bank", 
  "confirmation_text": "Super seçim! 🍿 CinemaPlus üçün Kapital Bank kartını seçdim (10% cashback!). 12 AZN ödənişi təsdiqləyək? 🚀"
}

#### 2. Incomplete Request (Context Aware)
- **Trigger**: User mentions Merchant ONLY (e.g., "Azercell kontur vur").
- **Logic**: Check history. Did they mention an amount (e.g., "5 manat") in the last 2 messages?
  - YES -> Trigger Payment Request immediately.
  - NO -> Ask for amount politely.
- **Response (If NO amount found)**:
{
  "type": "message",
  "text": "Məmnuniyyətlə! 😊 Bəs balansına nə qədər yükləmək istəyirsən? (Məsələn: 5 AZN) ✨"
}

#### 3. General Chat & Advisory
- **Trigger**: "Salam", "Necəsən", "Hansı kart yaxşıdır?", "Məsləhət ver".
- **Logic**: Chat freely. If they ask "Cinema üçün hansı kart?", look at your table and answer.
- **Response**:
{
  "type": "message",
  "text": "Salam dostum! 🍬 Bu gün keyfin necədir? Sənə qənaət etməkdə kömək etməyə hazıram. Bir yerə gedirsən, yoxsa ödənişimiz var? 😎"
}

### 🌍 USER CONTEXT (Mock Data):
- **Kapital Bank**: 350.00 AZN (Fav for Cinema/Grocery)
- **ABB Bank**: 850.50 AZN (Fav for Transport/Fuel)
- **Leobank**: 120.00 AZN (Fav for Dining)

CRITICAL: Return ONLY raw JSON. No markdown formatting. Always parse numbers from Azerbaijani texts ("on manat" -> 10, "5 m" -> 5).
`;



// ============================================================================
// Request/Response Types
// ============================================================================
interface ChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}

interface ChatRequest {
    text?: string;
    audio?: string; // base64 encoded
    mimeType?: string; // e.g., "audio/m4a", "audio/mp4", "audio/webm"
    history?: ChatMessage[];
}

interface PaymentResponse {
    type: "payment_request";
    merchant: string;
    category: string;
    amount: number;
    currency: string;
    card_hint?: string;
    confirmation_text: string;
}

interface MessageResponse {
    type: "message";
    text: string;
}

type AIResponse = PaymentResponse | MessageResponse;

// ============================================================================
// Main Handler
// ============================================================================
Deno.serve(async (req: Request) => {
    // Handle CORS preflight
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    try {
        // 1. Verify Authentication (JWT)
        // 1. Verify Authentication (JWT)
        const authHeader = req.headers.get('Authorization')
        let user = null;

        if (authHeader && authHeader !== 'Bearer ') {
            const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? 'https://yogtzppngpirrsywsxne.supabase.co';
            const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? 'sb_publishable_G1MJki54lDdMKDW8Tz--Rg_4ziiBb5G';

            const supabaseClient = createClient(
                supabaseUrl,
                supabaseAnonKey,
                { global: { headers: { Authorization: authHeader } } }
            )

            const { data, error } = await supabaseClient.auth.getUser()
            user = data.user;

            if (error) {
                console.error("Auth Warning: Token validation failed but proceeding for debug:", error);
            }
        } else {
            console.error("Auth Warning: No auth header present");
        }

        // BYPASS AUTH CHECK FOR DEBUGGING
        // if (userError || !user) { ... }



        // 2. Validate Gemini API key
        const apiKey = Deno.env.get("GEMINI_API_KEY");
        if (!apiKey) {
            console.error("Config Error: GEMINI_API_KEY missing");
            return new Response(
                JSON.stringify({ type: "message", text: "AI xidməti aktiv deyil (API Key yoxdur)." }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Parse request body
        const body: ChatRequest = await req.json();
        const { text, audio, mimeType, history = [] } = body;

        // Initialize Gemini
        const genAI = new GoogleGenerativeAI(apiKey);
        // Using Gemini 2.5 Flash for best quality
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: SYSTEM_PROMPT,
            generationConfig: {
                temperature: 0.1,
                topP: 1,
                maxOutputTokens: 1024,
            },
        });

        let result;

        // Handle audio input (multi-modal)
        if (audio) {
            console.log("Processing audio input...");
            console.log("Audio data length:", audio.length);
            console.log("MimeType:", mimeType);

            try {
                const audioPart = {
                    inlineData: {
                        data: audio,
                        mimeType: mimeType || "audio/mp4",
                    },
                };

                // For audio, we use generateContent with a clear instruction
                result = await model.generateContent([
                    "Listen to this audio and respond based on your system instructions. Respond ONLY with valid JSON.",
                    audioPart,
                    ...(history.length > 0 ? ["Previous conversation context:", JSON.stringify(history)] : [])
                ]);
            } catch (audioError: any) {
                console.error("Audio processing error:", audioError);
                return new Response(
                    JSON.stringify({
                        type: "message",
                        text: "Səs faylını emal edə bilmədim. Zəhmət olmasa yenidən danışın və ya mesaj yazın. Xəta: " + (audioError.message || "Unknown")
                    }),
                    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
                );
            }
        }
        // Handle text input with history
        else if (text) {
            console.log("Processing text input with " + history.length + " history items: " + text.substring(0, 50) + "...");

            // Gemini requires first message to be from 'user' - filter out leading 'model' messages
            let sanitizedHistory = history;
            const firstUserIndex = history.findIndex((h: any) => h.role === 'user');
            if (firstUserIndex > 0) {
                sanitizedHistory = history.slice(firstUserIndex);
            } else if (firstUserIndex < 0) {
                sanitizedHistory = []; // No user messages, start fresh
            }
            console.log("Sanitized history length:", sanitizedHistory.length);

            const chat = model.startChat({
                history: sanitizedHistory,
            });
            result = await chat.sendMessage(text);
        }

        // Extract response text
        const responseText = result?.response?.text();
        console.log("Gemini raw response:", responseText);

        if (!responseText) {
            return new Response(
                JSON.stringify({ type: "message", text: "AI cavab vermədi. Yenidən cəhd edin." }),
                { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Parse JSON
        let parsedResponse: AIResponse;
        try {
            let cleanedResponse = responseText.trim();

            // Extract JSON object if wrapped in text or markdown
            const jsonStartIndex = cleanedResponse.indexOf('{');
            const jsonEndIndex = cleanedResponse.lastIndexOf('}');

            if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
                cleanedResponse = cleanedResponse.substring(jsonStartIndex, jsonEndIndex + 1);
            }

            parsedResponse = JSON.parse(cleanedResponse);
        } catch (parseError) {
            console.error("JSON parse error, falling back to text message");
            parsedResponse = {
                type: "message",
                text: responseText,
            };
        }

        return new Response(
            JSON.stringify(parsedResponse),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
        console.error("Global Catch Edge Function:", error);
        return new Response(
            JSON.stringify({
                type: "message",
                text: "Server xetasi (Debug): " + errorMessage,
            }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
