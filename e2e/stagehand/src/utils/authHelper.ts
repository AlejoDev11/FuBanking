import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import jwt from 'jsonwebtoken';

function getJwtSecret(): string {
  try {
    const envPath = join(process.cwd(), 'backend/.env');
    const content = readFileSync(envPath, 'utf8');
    const match = content.match(/JWT_SECRET\s*=\s*([^\r\n]+)/);
    if (match?.[1]) {
      return match[1].trim();
    }
  } catch {}
  return 'super-secret-jwt-key-for-development-32-chars-min';
}

export function generateToken(user: { id: string; email: string; role: 'client' | 'admin' }): string {
  const secret = getJwtSecret();
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    secret,
    { expiresIn: '2h' }
  );
}

export const TEST_USERS = {
  client: {
    id: 'u-client-gabriel-001',
    email: 'bedoyacanoandres2@gmail.com',
    role: 'client' as const,
    fullName: 'Gabriel Cliente',
  },
  admin: {
    id: 'u-admin-andresito-001',
    email: 'bedoyacanoandres@gmail.com',
    role: 'admin' as const,
    fullName: 'Andresito Administrador',
  },
};

export async function authenticateBrowserContext(stagehandOrContext: any, user = TEST_USERS.client) {
  const token = generateToken(user);

  const userPayload = {
    id: user.id,
    email: user.email,
    firstName: user.role === 'admin' ? 'Andresito' : 'Gabriel',
    middleName: null,
    lastName: user.role === 'admin' ? 'Administrador' : 'Cliente',
    secondLastName: null,
    fullName: user.fullName,
    document: user.role === 'admin' ? '9988776655' : '1020304050',
    documentVerified: true,
    documentVerifiedAt: new Date().toISOString(),
    birthDate: '1995-05-15',
    phone: '3001234567',
    avatarUrl: null,
    monthlyIncome: 4500000,
    isActive: true,
    twoFactorEnabled: false,
    role: user.role,
    createdAt: new Date().toISOString(),
    requiresTwoFactor: false,
  };

  let targetContext = stagehandOrContext?.browser?.context ?? stagehandOrContext?.context ?? stagehandOrContext;
  if (typeof targetContext === 'function') {
    targetContext = targetContext();
  }
  if (targetContext && typeof targetContext.context === 'function') {
    targetContext = targetContext.context();
  }

  if (targetContext && typeof targetContext.addCookies === 'function') {
    await targetContext.addCookies([
      {
        name: 'token',
        value: token,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false,
        sameSite: 'Lax',
      },
    ]);
  }

  if (targetContext && typeof targetContext.addInitScript === 'function') {
    await targetContext.addInitScript(
      ({ t, u }: { t: string; u: any }) => {
        try {
          window.localStorage.setItem('token', t);
          window.localStorage.setItem('user', JSON.stringify(u));
        } catch {}
      },
      { t: token, u: userPayload }
    );
  }

  // Si recibimos una página directamente
  if (stagehandOrContext && typeof stagehandOrContext.addInitScript === 'function') {
    await stagehandOrContext.addInitScript(
      ({ t, u }: { t: string; u: any }) => {
        try {
          window.localStorage.setItem('token', t);
          window.localStorage.setItem('user', JSON.stringify(u));
        } catch {}
      },
      { t: token, u: userPayload }
    );
  }

  return token;
}
