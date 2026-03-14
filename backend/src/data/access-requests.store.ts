import type { AccessRequest } from "../types/access-request.js";

let accessRequests: AccessRequest[] = [];
let nextAccessRequestId = 1;

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