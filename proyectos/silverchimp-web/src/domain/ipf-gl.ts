/**
 * IPF GL Points (Goodlift) - official IPF formula.
 * Classic Raw, Full Power (S+B+D).
 *
 * Formula:
 *   coeff = 100 / (A - B * exp(-C * bodyweightKg))
 *   GL Points = totalKg * coeff
 *
 * Coefficients published by the IPF (current as of 2023-06-01).
 * Source: https://www.powerlifting.sport/fileadmin/ipf/data/ipf-formula/
 */
import type { Gender } from './schema';

interface GLParams {
  A: number;
  B: number;
  C: number;
}

const GL_PARAMS: Record<Gender, GLParams> = {
  M: { A: 1199.72839, B: 1025.18162, C: 0.00921 },
  F: { A: 583.86488, B: 501.83738, C: 0.00833 },
};

export function ipfGLCoefficient(bodyweightKg: number, gender: Gender): number {
  if (!Number.isFinite(bodyweightKg) || bodyweightKg <= 0) return 0;
  const { A, B, C } = GL_PARAMS[gender];
  const denom = A - B * Math.exp(-C * bodyweightKg);
  if (denom <= 0) return 0;
  return 100 / denom;
}

export function ipfGLPoints(totalKg: number, bodyweightKg: number, gender: Gender): number {
  if (totalKg <= 0 || bodyweightKg <= 0) return 0;
  return Math.round(totalKg * ipfGLCoefficient(bodyweightKg, gender) * 100) / 100;
}

export function formatGL(points: number): string {
  if (points <= 0) return '-';
  return points.toFixed(2);
}
