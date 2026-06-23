import { Config } from '../config';

export function greet(name: string): string {
  return `Hello, ${name}!`;
}

export function formatOutput(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

export function calculateScore(scores: number[]): number {
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}
