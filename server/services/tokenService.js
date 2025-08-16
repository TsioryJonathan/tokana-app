import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import RefreshToken from '../models/RefreshToken.js';

const ACCESS_TTL = process.env.ACCESS_TOKEN_TTL || '60m';
const REFRESH_TTL = process.env.REFRESH_TOKEN_TTL || '30d';

function addDuration(baseDate, duration) {
  // supports Nm, Nh, Nd
  const match = /^([0-9]+)([mhd])$/.exec(duration);
  if (!match) return new Date(Date.now() + 30 * 24 * 3600 * 1000);
  const val = parseInt(match[1], 10);
  const unit = match[2];
  const ms = unit === 'm' ? val * 60 * 1000 : unit === 'h' ? val * 3600 * 1000 : val * 24 * 3600 * 1000;
  return new Date(baseDate.getTime() + ms);
}

export function generateAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: ACCESS_TTL });
}

export async function createRefreshToken(userId, meta = {}) {
  const raw = crypto.randomBytes(48).toString('base64url');
  const tokenHash = crypto.createHash('sha256').update(raw + (process.env.JWT_REFRESH_SECRET || '')).digest('hex');
  const expiresAt = addDuration(new Date(), REFRESH_TTL);
  const rec = await RefreshToken.create({
    userId,
    tokenHash,
    expiresAt,
    userAgent: meta.userAgent || null,
    ip: meta.ip || null,
  });
  return { raw, record: rec };
}

export async function findTokenRecordByRaw(raw) {
  const tokenHash = crypto.createHash('sha256').update(raw + (process.env.JWT_REFRESH_SECRET || '')).digest('hex');
  return await RefreshToken.findOne({ where: { tokenHash } });
}

export async function rotateRefreshToken(oldRecord, meta = {}) {
  // mark old as rotated
  oldRecord.rotatedAt = new Date();
  await oldRecord.save();
  const { raw, record } = await createRefreshToken(oldRecord.userId, meta);
  oldRecord.replacedByTokenId = record.id;
  await oldRecord.save();
  return { raw, record };
}

export async function revokeToken(record) {
  record.revokedAt = new Date();
  await record.save();
}

export async function revokeAllUserTokens(userId) {
  await RefreshToken.update({ revokedAt: new Date() }, { where: { userId, revokedAt: null } });
}
