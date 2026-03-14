export type AccessRequest = {
  id: number;
  userId: number;
  date: string;
  comments: string;
};

export type AccessRequestDto = {
  userId: number;
  date: string;
  comments: string;
};

export type AccessRequestResponseDto = {
  id: number;
  userId: number;
  date: string;
  comments: string;
};

export type AccessRequestValidationIssue = {
  field: keyof AccessRequestDto;
  message: string;
};