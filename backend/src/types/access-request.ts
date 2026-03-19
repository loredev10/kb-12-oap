export type AccessRequest = {
  id: number;
  userId: number;
  startDateTime: string;
  endDateTime: string;
  comments: string;
  isDeleted: boolean;
};

export type CreateAccessRequestRequestDto = {
  userId: number;
  startDateTime: string;
  endDateTime: string;
  comments: string;
};

export type UpdateAccessRequestRequestDto = {
  userId: number;
  startDateTime: string;
  endDateTime: string;
  comments: string;
};

export type AccessRequestResponseDto = {
  id: number;
  userId: number;
  startDateTime: string;
  endDateTime: string;
  comments: string;
};

export type AccessRequestValidationIssue = {
  field: keyof CreateAccessRequestRequestDto;
  message: string;
};