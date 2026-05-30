import { all, get, run, type SqlParameter } from "../db/db-client.js";
import type {
  AccessRequest,
  AccessRequestStatus,
} from "../types/access-request.js";
import type { EntityStatusFilter } from "../utils/status-filter.js";

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

function buildOwnerScopedWhereClause(
  status: EntityStatusFilter,
  tableAlias = "",
): { whereClause: string; isDeletedParams: SqlParameter[] } {
  const prefix = tableAlias ? `${tableAlias}.` : "";

  if (status === "deleted") {
    return {
      whereClause: `WHERE ${prefix}user_id = ? AND ${prefix}is_deleted = ?`,
      isDeletedParams: [1],
    };
  }

  if (status === "all") {
    return {
      whereClause: `WHERE ${prefix}user_id = ?`,
      isDeletedParams: [],
    };
  }

  return {
    whereClause: `WHERE ${prefix}user_id = ? AND ${prefix}is_deleted = ?`,
    isDeletedParams: [0],
  };
}

export async function listAccessRequests(
  ownerUserId: number,
): Promise<AccessRequest[]> {
  const rows = await all<AccessRequestRow>(
    `
      SELECT
        id,
        user_id,
        start_date_time,
        end_date_time,
        comments,
        status,
        is_deleted
      FROM access_requests
      WHERE user_id = ?
      ORDER BY id DESC;
    `,
    [ownerUserId],
  );

  return rows.map(mapAccessRequestRow);
}

export async function findAccessRequestById(
  id: number,
): Promise<AccessRequest | undefined> {
  const row = await get<AccessRequestRow>(
    `
      SELECT
        id,
        user_id,
        start_date_time,
        end_date_time,
        comments,
        status,
        is_deleted
      FROM access_requests
      WHERE id = ?;
    `,
    [id],
  );

  if (!row) {
    return undefined;
  }

  return mapAccessRequestRow(row);
}

export async function createAccessRequest(
  data: Omit<AccessRequest, "id">,
): Promise<AccessRequest> {
  const result = await run(
    `
      INSERT INTO access_requests (
        user_id,
        start_date_time,
        end_date_time,
        comments,
        status,
        is_deleted
      )
      VALUES (?, ?, ?, ?, ?, ?);
    `,
    [
      data.userId,
      data.startDateTime,
      data.endDateTime,
      data.comments,
      data.status,
      data.isDeleted ? 1 : 0,
    ],
  );

  const created = await findAccessRequestById(result.lastID);

  if (!created) {
    throw new Error("Failed to load created access request.");
  }

  return created;
}

export async function replaceAccessRequest(
  item: AccessRequest,
  ownerUserId: number,
): Promise<AccessRequest | undefined> {
  const result = await run(
    `
      UPDATE access_requests
      SET
        start_date_time = ?,
        end_date_time = ?,
        comments = ?,
        status = ?,
        is_deleted = ?
      WHERE id = ? AND user_id = ?;
    `,
    [
      item.startDateTime,
      item.endDateTime,
      item.comments,
      item.status,
      item.isDeleted ? 1 : 0,
      item.id,
      ownerUserId,
    ],
  );

  if (result.changes === 0) {
    return undefined;
  }

  return findAccessRequestById(item.id);
}

export async function softDeleteAccessRequest(
  id: number,
  ownerUserId: number,
): Promise<boolean> {
  const result = await run(
    `
      UPDATE access_requests
      SET is_deleted = 1
      WHERE id = ? AND user_id = ? AND is_deleted = 0;
    `,
    [id, ownerUserId],
  );

  return result.changes > 0;
}

export async function countAccessRequests(
  status: EntityStatusFilter,
  ownerUserId: number,
): Promise<number> {
  const { whereClause, isDeletedParams } = buildOwnerScopedWhereClause(status);

  const row = await get<{ total: number }>(
    `
      SELECT COUNT(*) AS total
      FROM access_requests
      ${whereClause};
    `,
    [ownerUserId, ...isDeletedParams],
  );

  return Number(row?.total ?? 0);
}

export async function listAccessRequestsWithUsers(
  status: EntityStatusFilter,
  limit: number,
  ownerUserId: number,
): Promise<AccessRequestWithUser[]> {
  const safeLimit = Number.isFinite(limit)
    ? Math.min(Math.max(Math.trunc(limit), 1), 100)
    : 10;

  const { whereClause, isDeletedParams } = buildOwnerScopedWhereClause(
    status,
    "ar",
  );

  const rows = await all<AccessRequestWithUserRow>(
    `
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
      LIMIT ?;
    `,
    [ownerUserId, ...isDeletedParams, safeLimit],
  );

  return rows.map(mapAccessRequestWithUserRow);
}

function logSql(sql: string, params: SqlParameter[]): void {
  if (process.env.NODE_ENV !== "production") {
    console.log("[SQL]", sql.trim());
    console.log("[SQL params]", params);
  }
}

export async function searchAccessRequestsByComment(
  query: string,
  ownerUserId: number,
): Promise<AccessRequest[]> {
  const sql = `
    SELECT
      id,
      user_id,
      start_date_time,
      end_date_time,
      comments,
      status,
      is_deleted
    FROM access_requests
    WHERE user_id = ?
      AND comments LIKE ?
      AND is_deleted = 0
    ORDER BY id DESC
    LIMIT 20;
  `;

  const params = [ownerUserId, `%${query}%`];

  logSql(sql, params);

  const rows = await all<AccessRequestRow>(sql, params);

  return rows.map(mapAccessRequestRow);
}
