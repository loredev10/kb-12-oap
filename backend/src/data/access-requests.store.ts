import { all, get, run } from "../db/db-client.js";
import type {
  AccessRequest,
  AccessRequestStatus,
} from "../types/access-request.js";

type AccessRequestRow = {
  id: number;
  user_id: number;
  start_date_time: string;
  end_date_time: string;
  comments: string;
  status: string;
  is_deleted: number;
};

export type AccessRequestWithUserRow = {
  id: number;
  user_id: number;
  start_date_time: string;
  end_date_time: string;
  comments: string;
  status: string;
  is_deleted: number;
  user_full_name: string;
  user_email: string;
  user_role: string;
};

export type AccessRequestWithUser = {
  id: number;
  userId: number;
  startDateTime: string;
  endDateTime: string;
  comments: string;
  status: AccessRequestStatus;
  isDeleted: boolean;
  userFullName: string;
  userEmail: string;
  userRole: string;
};

function escapeSqlString(value: string): string {
  return value.replace(/'/g, "''");
}

function mapAccessRequestRow(row: AccessRequestRow): AccessRequest {
  return {
    id: Number(row.id),
    userId: Number(row.user_id),
    startDateTime: row.start_date_time,
    endDateTime: row.end_date_time,
    comments: row.comments,
    status: row.status as AccessRequestStatus,
    isDeleted: Boolean(row.is_deleted),
  };
}

function mapAccessRequestWithUserRow(
  row: AccessRequestWithUserRow,
): AccessRequestWithUser {
  return {
    id: Number(row.id),
    userId: Number(row.user_id),
    startDateTime: row.start_date_time,
    endDateTime: row.end_date_time,
    comments: row.comments,
    status: row.status as AccessRequestStatus,
    isDeleted: Boolean(row.is_deleted),
    userFullName: row.user_full_name,
    userEmail: row.user_email,
    userRole: row.user_role,
  };
}

function buildIsDeletedWhereClause(status: "active" | "deleted" | "all"): string {
  if (status === "deleted") {
    return "WHERE ar.is_deleted = 1";
  }

  if (status === "all") {
    return "";
  }

  return "WHERE ar.is_deleted = 0";
}

function buildIsDeletedWhereClauseForCount(
  status: "active" | "deleted" | "all",
): string {
  if (status === "deleted") {
    return "WHERE is_deleted = 1";
  }

  if (status === "all") {
    return "";
  }

  return "WHERE is_deleted = 0";
}

export async function listAccessRequests(): Promise<AccessRequest[]> {
  const rows = await all<AccessRequestRow>(`
    SELECT
      id,
      user_id,
      start_date_time,
      end_date_time,
      comments,
      status,
      is_deleted
    FROM access_requests
    ORDER BY id DESC;
  `);

  return rows.map(mapAccessRequestRow);
}

export async function findAccessRequestById(
  id: number,
): Promise<AccessRequest | undefined> {
  const row = await get<AccessRequestRow>(`
    SELECT
      id,
      user_id,
      start_date_time,
      end_date_time,
      comments,
      status,
      is_deleted
    FROM access_requests
    WHERE id = ${id};
  `);

  if (!row) {
    return undefined;
  }

  return mapAccessRequestRow(row);
}

export async function createAccessRequest(
  data: Omit<AccessRequest, "id">,
): Promise<AccessRequest> {
  const result = await run(`
    INSERT INTO access_requests (
      user_id,
      start_date_time,
      end_date_time,
      comments,
      status,
      is_deleted
    )
    VALUES (
      ${data.userId},
      '${escapeSqlString(data.startDateTime)}',
      '${escapeSqlString(data.endDateTime)}',
      '${escapeSqlString(data.comments)}',
      '${escapeSqlString(data.status)}',
      ${data.isDeleted ? 1 : 0}
    );
  `);

  const created = await findAccessRequestById(result.lastID);

  if (!created) {
    throw new Error("Failed to load created access request.");
  }

  return created;
}

export async function replaceAccessRequest(
  item: AccessRequest,
): Promise<AccessRequest | undefined> {
  const result = await run(`
    UPDATE access_requests
    SET
      user_id = ${item.userId},
      start_date_time = '${escapeSqlString(item.startDateTime)}',
      end_date_time = '${escapeSqlString(item.endDateTime)}',
      comments = '${escapeSqlString(item.comments)}',
      status = '${escapeSqlString(item.status)}',
      is_deleted = ${item.isDeleted ? 1 : 0}
    WHERE id = ${item.id};
  `);

  if (result.changes === 0) {
    return undefined;
  }

  return findAccessRequestById(item.id);
}

export async function softDeleteAccessRequest(id: number): Promise<boolean> {
  const result = await run(`
    UPDATE access_requests
    SET is_deleted = 1
    WHERE id = ${id} AND is_deleted = 0;
  `);

  return result.changes > 0;
}

export async function countAccessRequests(
  status: "active" | "deleted" | "all",
): Promise<number> {
  const whereClause = buildIsDeletedWhereClauseForCount(status);

  const row = await get<{ total: number }>(`
    SELECT COUNT(*) AS total
    FROM access_requests
    ${whereClause};
  `);

  return Number(row?.total ?? 0);
}

export async function listAccessRequestsWithUsers(
  status: "active" | "deleted" | "all",
  limit: number,
): Promise<AccessRequestWithUser[]> {
  const safeLimit = Number.isFinite(limit)
    ? Math.min(Math.max(Math.trunc(limit), 1), 100)
    : 10;

  const whereClause = buildIsDeletedWhereClause(status);

  const rows = await all<AccessRequestWithUserRow>(`
    SELECT
      ar.id,
      ar.user_id,
      ar.start_date_time,
      ar.end_date_time,
      ar.comments,
      ar.status,
      ar.is_deleted,
      u.full_name AS user_full_name,
      u.email AS user_email,
      u.role AS user_role
    FROM access_requests ar
    JOIN users u ON u.id = ar.user_id
    ${whereClause}
    ORDER BY ar.id DESC
    LIMIT ${safeLimit};
  `);

  return rows.map(mapAccessRequestWithUserRow);
}