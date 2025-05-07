export interface Permission {
  id: string;
  creationTimestamp: string;
  updateTimestamp: string;
  name: string;
  description: string;
}

export interface Role {
  id: string;
  creationTimestamp: string;
  updateTimestamp: string;
  name: string;
  description: string;
  permissions: Permission[];
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roleId: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}
