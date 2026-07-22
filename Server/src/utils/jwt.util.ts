import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';

export function signToken(payload: object, secret: string, expiresIn: string): string {
  const options: SignOptions = { expiresIn: expiresIn as any };
  return jwt.sign(payload, secret, options);
}

export function verifyToken(token: string, secret: string): JwtPayload {
  const decoded = jwt.verify(token, secret);
  if (typeof decoded === 'string') {
    throw new Error('Invalid token payload');
  }
  return decoded as JwtPayload;
}
