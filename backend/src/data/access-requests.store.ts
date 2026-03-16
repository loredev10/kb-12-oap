import type { AccessRequest } from "../types/access-request.js";

let accessRequests: AccessRequest[] = [
  {
    id: 1,
    userId: 1,
    startDateTime: "2026-03-18T09:00",
    endDateTime: "2026-03-18T11:00",
    comments: "Практична робота з мережевих технологій",
  },
  {
    id: 2,
    userId: 2,
    startDateTime: "2026-03-18T12:00",
    endDateTime: "2026-03-18T14:00",
    comments: "Проведення заняття в лабораторії",
  },
  {
    id: 3,
    userId: 3,
    startDateTime: "2026-03-19T10:30",
    endDateTime: "2026-03-19T13:00",
    comments: "Перевірка та налаштування обладнання",
  },
];

let nextAccessRequestId = 4;

export function getAccessRequests(): AccessRequest[] {
  return accessRequests;
}

export function allocateAccessRequestId(): number {
  return nextAccessRequestId++;
}

export function recomputeNextAccessRequestId(): void {
  if (accessRequests.length === 0) {
    nextAccessRequestId = 1;
    return;
  }

  nextAccessRequestId =
    Math.max(...accessRequests.map((item) => item.id)) + 1;
}