import type { User } from "../types/user.js";

let users: User[] = [
  {
    id: 1,
    fullName: "Павло Іваненко",
    email: "pavlo.ivanenko@example.com",
    role: "student",
    notes: "Потрібен доступ до лабораторії мереж",
  },
  {
    id: 2,
    fullName: "Олена Петренко",
    email: "olena.petrenko@example.com",
    role: "teacher",
    notes: "Викладач курсу з інформаційних систем",
  },
  {
    id: 3,
    fullName: "Андрій Коваль",
    email: "andrii.koval@example.com",
    role: "lab_assistant",
    notes: "Відповідає за обладнання лабораторії",
  },
];

let nextUserId = 4;

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