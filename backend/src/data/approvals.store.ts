import { all, get, run } from "../db/db-client.js";
import type { Approval, ApprovalDecision, PatchApprovalRequestDto } from "../types/approval.js";

type ApprovalRow = {
  id: number;
  access_request_id: number;
  approved_by_user_id: number;
  decision: string;
  comment: string;
  approved_at: string;
  is_deleted: number;
};

function escapeSqlString(value: string): string {
  return value.replace(/'/g, "''");
}

function mapApprovalRow(row: ApprovalRow): Approval {
  return {
    id: Number(row.id),
    accessRequestId: Number(row.access_request_id),
    approvedByUserId: Number(row.approved_by_user_id),
    decision: row.decision as ApprovalDecision,
    comment: row.comment,
    approvedAt: row.approved_at,
    isDeleted: Boolean(row.is_deleted),
  };
}

export async function listApprovals(): Promise<Approval[]> {
  const rows = await all<ApprovalRow>(`
    SELECT
      id,
      access_request_id,
      approved_by_user_id,
      decision,
      comment,
      approved_at,
      is_deleted
    FROM approvals
    ORDER BY id DESC;
  `);

  return rows.map(mapApprovalRow);
}

export async function findApprovalById(id: number): Promise<Approval | undefined> {
  const row = await get<ApprovalRow>(`
    SELECT
      id,
      access_request_id,
      approved_by_user_id,
      decision,
      comment,
      approved_at,
      is_deleted
    FROM approvals
    WHERE id = ${id};
  `);

  if (!row) {
    return undefined;
  }

  return mapApprovalRow(row);
}

export async function createApproval(
  data: Omit<Approval, "id" | "isDeleted">,
): Promise<Approval> {
  const result = await run(`
    INSERT INTO approvals (
      access_request_id,
      approved_by_user_id,
      decision,
      comment,
      approved_at,
      is_deleted
    )
    VALUES (
      ${data.accessRequestId},
      ${data.approvedByUserId},
      '${escapeSqlString(data.decision)}',
      '${escapeSqlString(data.comment)}',
      '${escapeSqlString(data.approvedAt)}',
      0
    );
  `);

  const created = await findApprovalById(result.lastID);

  if (!created) {
    throw new Error("Failed to load created approval.");
  }

  return created;
}

export async function replaceApproval(item: Approval): Promise<Approval | undefined> {
  const result = await run(`
    UPDATE approvals
    SET
      access_request_id = ${item.accessRequestId},
      approved_by_user_id = ${item.approvedByUserId},
      decision = '${escapeSqlString(item.decision)}',
      comment = '${escapeSqlString(item.comment)}',
      approved_at = '${escapeSqlString(item.approvedAt)}',
      is_deleted = ${item.isDeleted ? 1 : 0}
    WHERE id = ${item.id};
  `);

  if (result.changes === 0) {
    return undefined;
  }

  return findApprovalById(item.id);
}

export async function patchApproval(
  id: number,
  patch: PatchApprovalRequestDto,
): Promise<Approval | undefined> {
  const current = await findApprovalById(id);

  if (!current) {
    return undefined;
  }

  const nextApproval: Approval = {
    ...current,
    ...patch,
  };

  return replaceApproval(nextApproval);
}

export async function softDeleteApproval(id: number): Promise<boolean> {
  const result = await run(`
    UPDATE approvals
    SET is_deleted = 1
    WHERE id = ${id} AND is_deleted = 0;
  `);

  return result.changes > 0;
}