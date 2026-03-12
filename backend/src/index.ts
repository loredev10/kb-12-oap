import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

type UserRole = "student" | "teacher" | "lab_assistant" | "admin" | "";

type User = {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  notes: string;
};

type UserDto = {
  fullName: string;
  email: string;
  role: UserRole;
  notes: string;
};

type ValidationIssue = {
  field: keyof UserDto;
  message: string;
};

class ApiError extends Error {
  status: number;
  code: string;
  details: ValidationIssue[] | null;

  constructor(
    status: number,
    code: string,
    message: string,
    details: ValidationIssue[] | null = null,
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.resolve(__dirname, "../../frontend");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  const startedAt = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    console.log(
      `${req.method} ${req.originalUrl} -> ${res.statusCode} (${durationMs}ms)`,
    );
  });

  next();
});

// ===== In-memory data =====
let users: User[] = [];
let nextUserId = 1;

function recomputeNextUserId(items: User[]): number {
  if (items.length === 0) return 1;
  return Math.max(...items.map((item) => item.id)) + 1;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeUserDto(body: unknown): UserDto {
  const dto = (body ?? {}) as Partial<UserDto>;

  return {
    fullName: typeof dto.fullName === "string" ? dto.fullName.trim() : "",
    email: typeof dto.email === "string" ? dto.email.trim() : "",
    role: typeof dto.role === "string" ? (dto.role.trim() as UserRole) : "",
    notes: typeof dto.notes === "string" ? dto.notes.trim() : "",
  };
}

function validateUserDto(dto: UserDto): ValidationIssue[] {
  const errors: ValidationIssue[] = [];

  if (dto.fullName === "") {
    errors.push({
      field: "fullName",
      message: "Поле є обов’язковим.",
    });
  } else if (dto.fullName.length < 3 || dto.fullName.length > 60) {
    errors.push({
      field: "fullName",
      message: "Довжина має бути від 3 до 60 символів.",
    });
  }

  if (dto.email === "") {
    errors.push({
      field: "email",
      message: "Email є обов’язковим.",
    });
  } else if (!isValidEmail(dto.email)) {
    errors.push({
      field: "email",
      message: "Введіть коректний Email.",
    });
  }

  if (dto.role === "") {
    errors.push({
      field: "role",
      message: "Оберіть роль.",
    });
  }

  if (dto.notes !== "" && dto.notes.length < 5) {
    errors.push({
      field: "notes",
      message:
        "Коментар має містити щонайменше 5 символів (або залиште порожнім).",
    });
  }

  return errors;
}

function parseId(rawId: string): number {
  const id = Number(rawId);

  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError(400, "INVALID_ID", "Некоректний id.");
  }

  return id;
}

// ===== API =====
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ ok: true });
});

app.get("/api/users", (_req: Request, res: Response) => {
  res.status(200).json({ items: users });
});

app.get(
  "/api/users/:id",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseId(req.params.id);
      const user = users.find((item) => item.id === id);

      if (!user) {
        throw new ApiError(404, "NOT_FOUND", "Користувача не знайдено.");
      }

      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },
);

app.post("/api/users", (req: Request, res: Response, next: NextFunction) => {
  try {
    const dto = normalizeUserDto(req.body);
    const validationErrors = validateUserDto(dto);

    if (validationErrors.length > 0) {
      throw new ApiError(
        400,
        "VALIDATION_ERROR",
        "Некоректні дані користувача.",
        validationErrors,
      );
    }

    const newUser: User = {
      id: nextUserId++,
      ...dto,
    };

    users.push(newUser);

    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
});

app.put(
  "/api/users/:id",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseId(req.params.id);
      const dto = normalizeUserDto(req.body);
      const validationErrors = validateUserDto(dto);

      if (validationErrors.length > 0) {
        throw new ApiError(
          400,
          "VALIDATION_ERROR",
          "Некоректні дані користувача.",
          validationErrors,
        );
      }

      const index = users.findIndex((item) => item.id === id);

      if (index === -1) {
        throw new ApiError(404, "NOT_FOUND", "Користувача не знайдено.");
      }

      const updatedUser: User = {
        id,
        ...dto,
      };

      users[index] = updatedUser;

      res.status(200).json(updatedUser);
    } catch (error) {
      next(error);
    }
  },
);

app.delete(
  "/api/users/:id",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseId(req.params.id);
      const index = users.findIndex((item) => item.id === id);

      if (index === -1) {
        throw new ApiError(404, "NOT_FOUND", "Користувача не знайдено.");
      }

      users.splice(index, 1);
      nextUserId = recomputeNextUserId(users);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);

// ===== Frontend static files =====
app.use(express.static(frontendDir));

app.get("/", (_req: Request, res: Response) => {
  res.sendFile(path.join(frontendDir, "index.html"));
});

// ===== 404 =====
app.use((req: Request, _res: Response, next: NextFunction) => {
  if (!req.path.startsWith("/api/")) {
    next(new ApiError(404, "NOT_FOUND", "Сторінку не знайдено."));
    return;
  }

  next(new ApiError(404, "NOT_FOUND", "Маршрут не знайдено."));
});

// ===== Error handler =====
app.use(
  (
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction,
  ): void => {
    if (error instanceof ApiError) {
      res.status(error.status).json({
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      });
      return;
    }

    console.error("Unhandled error:", error);

    res.status(500).json({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Внутрішня помилка сервера.",
        details: null,
      },
    });
  },
);

app.listen(PORT, () => {
  console.log(`API started on http://localhost:${PORT}`);
});