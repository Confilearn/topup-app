// Mock data for TopupAfrica VTU platform

export interface Transaction {
  id: string;
  type: 'airtime' | 'data' | 'electricity' | 'cable' | 'bills' | 'internet' | 'deposit';
  provider?: string;
  amount: number;
  fee: number;
  status: 'completed' | 'failed' | 'pending';
  date: string;
  phone?: string;
  reference: string;
  description: string;
  recipient?: string;
}

export interface ReferredUser {
  id: string;
  name: string;
  joinDate: string;
  earnings: number;
  status: 'active' | 'inactive';
}

export const MOCK_USER = {
  id: '1',
  firstName: 'Ezeorah',
  lastName: 'Confidence',
  username: 'confilearn',
  email: 'confilearn@gmail.com',
  phone: '09042080831',
  joinDate: 'March 2026',
  accountStatus: 'Verified',
  referralCode: 'CONFI2026',
  referralLink: 'https://topupafrica.online/ref/CONFI2026',
};

export const MOCK_WALLET = {
  balance: 445.00,
  virtualAccount: {
    bankName: 'Paystack-Titan',
    accountNumber: '9754720931',
    accountName: 'Ezeorah Confidence - TopupAfrica',
    provider: 'TopupAfrica',
  },
};

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '69a7f3b5e85d1047d-001',
    type: 'airtime',
    provider: 'MTN',
    amount: 55,
    fee: 5,
    status: 'completed',
    date: '4 March 2026 at 09:56',
    phone: '08012345678',
    reference: 'TXN-MTN-001-2026',
    description: 'MTN Airtime',
    recipient: '08012345678',
  },
  {
    id: '69a7f3b5e85d1047d-002',
    type: 'airtime',
    provider: 'MTN',
    amount: 330,
    fee: 30,
    status: 'failed',
    date: '4 March 2026 at 10:15',
    phone: '08098765432',
    reference: 'TXN-MTN-002-2026',
    description: 'MTN Airtime',
    recipient: '08098765432',
  },
  {
    id: '69a7f3b5e85d1047d-003',
    type: 'deposit',
    amount: 50,
    fee: 5,
    status: 'completed',
    date: '4 March 2026 at 11:30',
    reference: 'DEP-BNK-003-2026',
    description: 'Deposit',
  },
  {
    id: '69a7f3b5e85d1047d-004',
    type: 'data',
    provider: 'Airtel',
    amount: 505,
    fee: 50.5,
    status: 'completed',
    date: '3 March 2026 at 14:22',
    phone: '09023456789',
    reference: 'TXN-AIR-004-2026',
    description: 'Airtel 1GB Data',
    recipient: '09023456789',
  },
  {
    id: '69a7f3b5e85d1047d-005',
    type: 'electricity',
    provider: 'EKEDC',
    amount: 2000,
    fee: 200,
    status: 'completed',
    date: '2 March 2026 at 09:00',
    reference: 'TXN-EKE-005-2026',
    description: 'EKEDC Electricity',
    recipient: '12345678901',
  },
  {
    id: '69a7f3b5e85d1047d-006',
    type: 'cable',
    provider: 'DSTV',
    amount: 8000,
    fee: 800,
    status: 'pending',
    date: '1 March 2026 at 16:45',
    reference: 'TXN-DST-006-2026',
    description: 'DSTV Subscription',
    recipient: '1234567890',
  },
  {
    id: '69a7f3b5e85d1047d-007',
    type: 'internet',
    provider: 'Spectranet',
    amount: 3000,
    fee: 300,
    status: 'failed',
    date: '28 February 2026 at 12:00',
    reference: 'TXN-SPE-007-2026',
    description: 'Spectranet Internet',
    recipient: 'spec123456',
  },
];

export const MOCK_DEPOSITS: Transaction[] = [
  {
    id: 'DEP-001',
    type: 'deposit',
    amount: 50,
    fee: 5,
    status: 'completed',
    date: '4 March 2026 at 11:30',
    reference: 'DEP-BNK-001-2026',
    description: 'Bank Transfer',
  },
  {
    id: 'DEP-002',
    type: 'deposit',
    amount: 1000,
    fee: 100,
    status: 'completed',
    date: '2 March 2026 at 09:00',
    reference: 'DEP-BNK-002-2026',
    description: 'Bank Transfer',
  },
  {
    id: 'DEP-003',
    type: 'deposit',
    amount: 5000,
    fee: 500,
    status: 'pending',
    date: '28 February 2026 at 14:00',
    reference: 'DEP-BNK-003-2026',
    description: 'Bank Transfer',
  },
];

export const MOCK_REFERRALS = {
  totalReferrals: 12,
  totalEarnings: 2400,
  referralBonus: 200,
  pendingBonus: 400,
  users: [
    {
      id: 'REF-001',
      name: 'John Doe',
      joinDate: 'March 2026',
      earnings: 200,
      status: 'active' as const,
    },
    {
      id: 'REF-002',
      name: 'Jane Smith',
      joinDate: 'February 2026',
      earnings: 200,
      status: 'active' as const,
    },
    {
      id: 'REF-003',
      name: 'Mike Johnson',
      joinDate: 'February 2026',
      earnings: 200,
      status: 'inactive' as const,
    },
    {
      id: 'REF-004',
      name: 'Sarah Williams',
      joinDate: 'January 2026',
      earnings: 200,
      status: 'active' as const,
    },
  ] as ReferredUser[],
};

export const NETWORKS = ['MTN', 'Airtel', 'Glo', '9mobile'];

export const DATA_PLANS: Record<string, { label: string; amount: number; validity: string }[]> = {
  MTN: [
    { label: 'MTN 1GB', amount: 505, validity: '30 Days' },
    { label: 'MTN 2GB', amount: 1010, validity: '30 Days' },
    { label: 'MTN 5GB', amount: 2525, validity: '30 Days' },
    { label: 'MTN 10GB', amount: 5050, validity: '30 Days' },
  ],
  Airtel: [
    { label: 'Airtel 1GB', amount: 500, validity: '30 Days' },
    { label: 'Airtel 2GB', amount: 1000, validity: '30 Days' },
    { label: 'Airtel 5GB', amount: 2500, validity: '30 Days' },
  ],
  Glo: [
    { label: 'Glo 1GB', amount: 450, validity: '30 Days' },
    { label: 'Glo 2GB', amount: 900, validity: '30 Days' },
    { label: 'Glo 5GB', amount: 2250, validity: '30 Days' },
  ],
  '9mobile': [
    { label: '9mobile 1GB', amount: 500, validity: '30 Days' },
    { label: '9mobile 2GB', amount: 1000, validity: '30 Days' },
  ],
};

export const CABLE_PROVIDERS = ['DSTV', 'GOtv', 'Startimes'];

export const CABLE_PLANS: Record<string, { label: string; amount: number }[]> = {
  DSTV: [
    { label: 'Padi (N1,850)', amount: 1850 },
    { label: 'Yanga (N2,950)', amount: 2950 },
    { label: 'Confam (N6,200)', amount: 6200 },
    { label: 'Compact (N10,500)', amount: 10500 },
    { label: 'Premium (N24,500)', amount: 24500 },
  ],
  GOtv: [
    { label: 'Smallie (N900)', amount: 900 },
    { label: 'Jinja (N1,900)', amount: 1900 },
    { label: 'Jolli (N2,800)', amount: 2800 },
    { label: 'Max (N4,150)', amount: 4150 },
  ],
  Startimes: [
    { label: 'Nova (N900)', amount: 900 },
    { label: 'Basic (N1,800)', amount: 1800 },
    { label: 'Classic (N2,600)', amount: 2600 },
  ],
};

export const ELECTRICITY_PROVIDERS = ['EKEDC', 'IKEDC', 'PHEDC', 'AEDC', 'KEDCO', 'EEDC'];

export const AIRTIME_AMOUNTS = [50, 100, 200, 500, 1000, 2000];

export const MOCK_PIN = '1234';
export const MOCK_PASSWORD = 'password123';
