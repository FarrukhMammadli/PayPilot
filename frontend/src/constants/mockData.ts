// Static configuration data for CardAssistant
// NOTE: Card/Transaction data comes from Supabase, not here

// Service icons configuration (static UI config, not user data)
export const SERVICES = [
    { id: '1', icon: 'popcorn', label: 'cinema', color: '#EC4899' },
    { id: '2', icon: 'parking-circle', label: 'parking', color: '#3B82F6' },
    { id: '3', icon: 'shield-plus', label: 'insurance', color: '#EF4444' },
    { id: '4', icon: 'landmark', label: 'state', color: '#A855F7' },
    { id: '5', icon: 'bus', label: 'transport', color: '#22C55E' },
    { id: '6', icon: 'qr-code', label: 'qrPay', color: '#FFFFFF' },
    { id: '7', icon: 'gift', label: 'bonuses', color: '#F97316' },
    { id: '8', icon: 'more-horizontal', label: 'all', color: '#6B7280' },
];

// Mock loan/debt data for AI responses
export const LOAN_DATA = {
    hasLoan: true,
    loans: [
        {
            id: '1',
            type: 'consumer', // istehlak krediti
            bank: 'Kapital Bank',
            totalAmount: 5000,
            remainingAmount: 3250.45,
            monthlyPayment: 245.50,
            nextPaymentDate: '2025-01-05',
            interestRate: 18,
            currency: 'AZN',
        },
        {
            id: '2',
            type: 'installment', // taksit
            bank: 'ABB',
            merchant: 'Kontakt Home',
            totalAmount: 1200,
            remainingAmount: 800,
            monthlyPayment: 100,
            nextPaymentDate: '2025-01-10',
            interestRate: 0,
            currency: 'AZN',
        },
    ],
    creditCards: [
        {
            id: '1',
            bank: 'Kapital Bank',
            limit: 2000,
            used: 450.25,
            available: 1549.75,
            minPayment: 45,
            paymentDue: '2025-01-15',
            currency: 'AZN',
            cashback: {
                dining: 5,
                cinema: 10,
                groceries: 2,
                partners: ['CinemaPlus', 'Bravo', 'Wolt']
            }
        },
        {
            id: '2',
            bank: 'ABB',
            limit: 1500,
            used: 200,
            available: 1300,
            minPayment: 20,
            paymentDue: '2025-01-20',
            currency: 'AZN',
            cashback: {
                fuel: 5,
                transport: 3,
                electronics: 2,
                partners: ['Azpetrol', 'Kontakt Home', 'Bolt']
            }
        }
    ],
};

// Quick action suggestions (static UI prompts)
export const QUICK_ACTIONS_EN = [
    '💡 Pay Electricity',
    '📶 Top-up Azercell',
    '🔥 Pay Gas (Azeriqaz)',
    '💧 Pay Water',
    '💸 Send Money',
];

export const QUICK_ACTIONS_AZ = [
    '💡 İşıq haqqı ödə',
    '📶 Azercell artır',
    '🔥 Qaz pulu ödə',
    '💧 Su pulu ödə',
    '💸 Pul göndər',
];
