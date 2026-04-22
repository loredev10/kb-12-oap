import { all, get, run } from "../db/db-client.js";
import type { AccessRequest } from "../types/access-request.js";

type AccessRequestRow = {
  id: number;
  user_id: number;
  start_date_time: string;
  end_date_time: string;
  comments: string;
  is_deleted: number;
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
    isDeleted: Boolean(row.is_deleted),
  };
}

export async function listAccessRequests(): Promise<AccessRequest[]> {
  const rows = await all<AccessRequestRow>(`
    SELECT
      id,
      user_id,
      start_date_time,
      end_date_time,
      comments,
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
      is_deleted
    )
    VALUES (
      ${data.userId},
      '${escapeSqlString(data.startDateTime)}',
      '${escapeSqlString(data.endDateTime)}',
      '${escapeSqlString(data.comments)}',
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