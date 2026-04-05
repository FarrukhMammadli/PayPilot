# CardAssistant Backend

This folder contains all backend-related code for the CardAssistant application.

## Structure

```
backend/
└── supabase/
    ├── migrations/
    │   └── 001_initial_schema.sql    # Database tables, RLS, and triggers
    └── functions/
        └── ai-chat/
            └── index.ts              # Gemini AI Edge Function
```

## Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the migration file:
   - `migrations/001_initial_schema.sql`
3. Copy your project URL and anon key to `frontend/.env`
4. Set `GEMINI_API_KEY` in Supabase Dashboard → Edge Functions → Secrets

## Database Schema

| Table | Purpose |
|-------|---------|
| `profiles` | User profile data (auto-created on signup) |
| `cards` | User bank cards with balances |
| `transactions` | Payment history |
| `messages` | Chat history for AI assistant |

## RPC Functions

- **`process_payment`**: Atomic payment processing (checks balance, deducts, logs transaction)

## Edge Functions

### `ai-chat`
AI-powered chat endpoint using Google Gemini 2.5 Flash.

**Endpoint:** `POST /functions/v1/ai-chat`

**Request Body:**
```json
{
  "text": "isiq pulu 20 man ode",
  "audio": "base64_encoded_audio (optional)",
  "mimeType": "audio/m4a (optional)"
}
```

**Response (Payment):**
```json
{
  "type": "payment_request",
  "merchant": "Azerishiq",
  "category": "Utilities",
  "amount": 20.0,
  "currency": "AZN",
  "card_hint": "ABB",
  "confirmation_text": "ABB kartı ilə Azərişıq üçün 20 AZN ödəyirəm?"
}
```

**Response (Message):**
```json
{
  "type": "message",
  "text": "Nə qədər ödəmək istəyirsiniz?"
}
```

## Security

Row Level Security (RLS) is enabled on all tables. Users can only access their own data.
