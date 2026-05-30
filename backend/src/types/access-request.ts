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
  startDateTime: string;
  endDateTime: string;
  comments: string;
  status: AccessRequestStatus;
};

export type UpdateAccessRequestRequestDto = {
  startDateTime: string;
  endDateTime: string;
  comments: string;
  status: AccessRequestStatus;
};

export type PatchAccessRequestRequestDto = {
  startDateTime?: string;
  endDateTime?: string;
  comments?: string;
  status?: AccessRequestStatus;
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
