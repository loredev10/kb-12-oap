import type { Approval, ApprovalResponseDto } from "../types/approval.js";

export function toApprovalResponseDto(approval: Approval): ApprovalResponseDto {
  return {
    id: approval.id,
    accessRequestId: approval.accessRequestId,
    approvedByUserId: approval.approvedByUserId,
    decision: approval.decision,
    comment: approval.comment,
    approvedAt: approval.approvedAt,
  };
}