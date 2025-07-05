export interface User {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  lastLogin: string;
  status: 'active' | 'inactive';
}

const getDateAgo = (days: number, hours: number = 0, minutes: number = 0): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(date.getHours() - hours);
  date.setMinutes(date.getMinutes() - minutes);
  return date.toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export const users: User[] = [
  {
    id: 'usr_001',
    name: 'Admin User',
    email: 'admin@figerout.com',
    initials: 'A',
    role: 'Admin',
    lastLogin: getDateAgo(0, 0, 5),
    status: 'active',
  },
  {
    id: 'usr_002',
    name: 'Emily Carter',
    email: 'emily.carter@example.com',
    initials: 'EC',
    role: 'Editor',
    lastLogin: getDateAgo(1, 3, 20),
    status: 'active',
  },
  {
    id: 'usr_003',
    name: 'David Lee',
    email: 'david.lee@example.com',
    initials: 'DL',
    role: 'Viewer',
    lastLogin: getDateAgo(3, 8, 45),
    status: 'inactive',
  },
  {
    id: 'usr_004',
    name: 'Sophia Chen',
    email: 'sophia.chen@example.com',
    initials: 'SC',
    role: 'Editor',
    lastLogin: getDateAgo(0, 2, 10),
    status: 'active',
  },
  {
    id: 'usr_005',
    name: 'Michael Rodriguez',
    email: 'michael.r@example.com',
    initials: 'MR',
    role: 'Viewer',
    lastLogin: getDateAgo(7, 1, 0),
    status: 'active',
  },
];
