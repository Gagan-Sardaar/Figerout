
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
    id: 'usr_admin',
    name: 'Admin User',
    email: 'admin@figerout.com',
    initials: 'AU',
    role: 'Admin',
    lastLogin: { days: 0, hours: 0, minutes: 5 },
    status: 'active',
  },
  {
    id: 'usr_editor',
    name: 'Editor User',
    email: 'editor@figerout.com',
    initials: 'EU',
    role: 'Editor',
    lastLogin: { days: 1, hours: 2, minutes: 15 },
    status: 'active',
  },
  {
    id: 'usr_visitor',
    name: 'Visitor User',
    email: 'visitor@figerout.com',
    initials: 'VU',
    role: 'Viewer',
    lastLogin: { days: 2, hours: 5, minutes: 30 },
    status: 'active',
  },
];
