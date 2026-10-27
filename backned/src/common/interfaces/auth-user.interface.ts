import { Role } from '@prisma/client';

export interface AuthUser {
  id: string;
  sub: string;
  email: string;
  role: Role;
}
