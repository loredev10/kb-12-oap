import type { User } from "../types/user.js";

let users: User[] = [];
let nextUserId = 1;

export function getUsers(): User[] {
  return users;
}

export function allocateUserId(): number {
  return nextUserId++;
}

export function recomputeNextUserId(): void {
  if (users.length === 0) {
    nextUserId = 1;
    return;
  }

  nextUserId = Math.max(...users.map((item) => item.id)) + 1;
}