export type ApprovalDecision = "approved" | "rejected";

export type Approval = {
  id: number;
  accessRequestId: number;
  approvedByUserId: number;
  decision: ApprovalDecision;
  comment: string;
  approvedAt: string;
  isDeleted: boolean;
};

export type CreateApprovalRequestDto = {
  accessRequestId: number;
  approvedByUserId: number;
  decision: ApprovalDecision;
  comment: string;
  approvedAt: string;
};

export type UpdateApprovalRequestDto = {
  accessRequestId: number;
  approvedByUserId: number;
  decision: ApprovalDecision;
  comment: string;
  approvedAt: string;
};

export type PatchApprovalRequestDto = {
  accessRequestId?: number;
  approvedByUserId?: number;
  decision?: ApprovalDecision;
  comment?: string;
  approvedAt?: string;
  isDeleted?: boolean;
};

export type ApprovalResponseDto = {
  id: number;
  accessRequestId: number;
  approvedByUserId: number;
  decision: ApprovalDecision;
  comment: string;
  approvedAt: string;
};

export type ApprovalValidationIssue = {
  field: string;
  message: string;
};