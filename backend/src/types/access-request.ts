export type AccessRequest = {
  id: number;
  userId: number;
  startDateTime: string;
  endDateTime: string;
  comments: string;
};

export type AccessRequestDto = {
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
  field: keyof AccessRequestDto;
  message: string;
};