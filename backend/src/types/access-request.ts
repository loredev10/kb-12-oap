export type AccessRequestStatus = "pending" | "approved" | "rejected";

export type AccessRequest = {
  id: number;
  userId: number;
  startDateTime: string;
  endDateTime: string;
  comments: string;
  status: AccessRequestStatus;
  isDeleted: boolean;
};

export type CreateAccessRequestRequestDto = {
  userId: number;
  startDateTime: string;
  endDateTime: string;
  comments: string;
  status: AccessRequestStatus;
};

export type UpdateAccessRequestRequestDto = {
  userId: number;
  startDateTime: string;
  endDateTime: string;
  comments: string;
  status: AccessRequestStatus;
};

export type PatchAccessRequestRequestDto = {
  userId?: number;
  startDateTime?: string;
  endDateTime?: string;
  comments?: string;
  status?: AccessRequestStatus;
  isDeleted?: boolean;
};

export type AccessRequestResponseDto = {
  id: number;
  userId: number;
  startDateTime: string;
  endDateTime: string;
  comments: string;
  status: AccessRequestStatus;
};

export type AccessRequestValidationIssue = {
  field: string;
  message: string;
};