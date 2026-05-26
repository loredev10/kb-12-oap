import { all, get, run } from "../db/db-client.js";
import type { PatchUserRequestDto, User } from "../types/user.js";

type UserRow = {
  id: number;
  full_name: string;
  email: string;
  role: User["role"];
  notes: string;
  is_deleted: number;
};

function mapUserRow(row: UserRow): User {
  return {
    id: Number(row.id),
    fullName: row.full_name,
    email: row.email,
    role: row.role,
    notes: row.notes,
    isDeleted: Boolean(row.is_deleted),
  };
}

export async function listUsers(): Promise<User[]> {
  const rows = await all<UserRow>(`
    SELECT
      id,
      full_name,
      email,
      role,
      notes,
      is_deleted
    FROM users
    ORDER BY id DESC;
  `);

  return rows.map(mapUserRow);
}

export async function findUserById(id: number): Promise<User | undefined> {
  const row = await get<UserRow>(
    `
      SELECT
        id,
        full_name,
        email,
        role,
        notes,
        is_deleted
      FROM users
      WHERE id = ?;
    `,
    [id],
  );

  if (!row) {
    return undefined;
  }

  return mapUserRow(row);
}

export async function createUser(
  data: Omit<User, "id" | "isDeleted">,
): Promise<User> {
  const result = await run(
    `
      INSERT INTO users (
        full_name,
        email,
        role,
        notes,
        is_deleted
      )
      VALUES (?, ?, ?, ?, 0);
    `,
    [data.fullName, data.email, data.role, data.notes],
  );

  const created = await findUserById(result.lastID);

  if (!created) {
    throw new Error("Failed to load created user.");
  }

  return created;
}

export async function replaceUser(item: User): Promise<User | undefined> {
  const result = await run(
    `
      UPDATE users
      SET
        full_name = ?,
        email = ?,
        role = ?,
        notes = ?,
        is_deleted = ?
      WHERE id = ?;
    `,
    [
      item.fullName,
      item.email,
      item.role,
      item.notes,
      item.isDeleted ? 1 : 0,
      item.id,
    ],
  );

  if (result.changes === 0) {
    return undefined;
  }

  return await findUserById(item.id);
}

export async function patchUser(
  id: number,
  patch: PatchUserRequestDto,
): Promise<User | undefined> {
  const current = await findUserById(id);

  if (!current) {
    return undefined;
  }

  const nextUser: User = {
    ...current,
    ...patch,
  };

  return replaceUser(nextUser);
}

export async function softDeleteUser(id: number): Promise<boolean> {
  const result = await run(
    `
      UPDATE users
      SET is_deleted = 1
      WHERE id = ? AND is_deleted = 0;
    `,
    [id],
  );

  return result.changes > 0;
}
