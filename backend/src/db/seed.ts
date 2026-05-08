import { migrate } from "./migrate.js";
import { run } from "./db-client.js";

export async function seed(): Promise<void> {
  await migrate();

  await run(`
    INSERT OR IGNORE INTO users (
      id,
      full_name,
      email,
      role,
      notes,
      is_deleted
    )
    VALUES
      (1, 'Павло Іваненко', 'pavlo.ivanenko@example.com', 'student', 'Потрібен доступ до лабораторії мереж', 0),
      (2, 'Олена Петренко', 'olena.petrenko@example.com', 'teacher', 'Викладач курсу з інформаційних систем', 0),
      (3, 'Андрій Коваль', 'andrii.koval@example.com', 'lab_assistant', 'Відповідає за обладнання лабораторії', 0);
  `);

  await run(`
    INSERT OR IGNORE INTO access_requests (
      id,
      user_id,
      start_date_time,
      end_date_time,
      comments,
      status,
      is_deleted
    )
    VALUES
      (1, 1, '2026-03-18T09:00', '2026-03-18T11:00', 'Практична робота з мережевих технологій', 'pending', 0),
      (2, 2, '2026-03-18T12:00', '2026-03-18T14:00', 'Проведення заняття в лабораторії', 'approved', 0),
      (3, 3, '2026-03-19T10:30', '2026-03-19T13:00', 'Перевірка та налаштування обладнання', 'rejected', 0);
  `);

  console.log("DB seed completed");
}

seed().catch((error: unknown) => {
  console.error("Seed error:", error);
  process.exit(1);
});