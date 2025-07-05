
export interface User {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  lastLogin: { days: number; hours?: number; minutes?: number };
  status: 'active' | 'inactive' | 'invited';
}

// This type will be used on the client-side to display formatted dates.
export interface DisplayUser extends Omit<User, 'lastLogin'> {
    lastLogin: string;
}

export const users: User[] = [
  {
    id: 'usr_001',
    name: 'Admin User',
    email: 'admin@figerout.com',
    initials: 'A',
    role: 'Admin',
    lastLogin: { days: 0, hours: 0, minutes: 5 },
    status: 'active',
  },
  {
    id: 'usr_002',
    name: 'Emily Carter',
    email: 'emily.carter@example.com',
    initials: 'EC',
    role: 'Editor',
    lastLogin: { days: 1, hours: 3, minutes: 20 },
    status: 'active',
  },
  {
    id: 'usr_003',
    name: 'David Lee',
    email: 'david.lee@example.com',
    initials: 'DL',
    role: 'Viewer',
    lastLogin: { days: 3, hours: 8, minutes: 45 },
    status: 'inactive',
  },
  {
    id: 'usr_004',
    name: 'Sophia Chen',
    email: 'sophia.chen@example.com',
    initials: 'SC',
    role: 'Editor',
    lastLogin: { days: 0, hours: 2, minutes: 10 },
    status: 'active',
  },
  {
    id: 'usr_005',
    name: 'Michael Rodriguez',
    email: 'michael.r@example.com',
    initials: 'MR',
    role: 'Viewer',
    lastLogin: { days: 7, hours: 1, minutes: 0 },
    status: 'active',
  },
];
