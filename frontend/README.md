# CardAssistant Frontend

React Native (Expo) mobile application for CardAssistant.

## Quick Start

```bash
cd frontend
npm install
npx expo start
```

## Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```
EXPO_PUBLIC_SUPABASE_URL=your_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Project Structure

```
frontend/
├── App.tsx                 # Entry point
├── src/
│   ├── components/         # Reusable UI components
│   ├── screens/            # Screen components
│   ├── context/            # React Context providers
│   ├── services/           # Database and API services
│   ├── lib/                # Supabase client setup
│   ├── constants/          # Theme and mock data
│   └── types/              # TypeScript interfaces
└── package.json
```

## Key Features

- **Authentication**: Supabase Auth with secure session persistence
- **Wallet**: View and manage bank cards
- **AI Chat**: Natural language payment commands
- **Insights**: Spending analytics and category breakdown
