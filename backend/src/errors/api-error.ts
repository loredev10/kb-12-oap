import type { ValidationIssue } from "../types/user.js";

export class ApiError extends Error {
  status: number;
  code: string;
  details: ValidationIssue[] | null;

  constructor(
    status: number,
    code: string,
    message: string,
    details: ValidationIssue[] | null = null,
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}