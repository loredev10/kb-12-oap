import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import {
  allocateUserId,
  getUsers,
} from "../data/users.store.js";
import { ApiError } from "../errors/api-error.js";
import { toUserResponseDto } from "../mappers/user.mapper.js";
import type { User } from "../types/user.js";
import { parseId } from "../utils/parse-id.js";
import {
  normalizeCreateUserRequestDto,
  normalizeUpdateUserRequestDto,
  validateCreateUserRequestDto,
  validateUpdateUserRequestDto,
} from "../validators/user.validator.js";

export const usersRouter = Router();

usersRouter.get("/", (_req: Request, res: Response) => {
  const activeUsers = getUsers().filter((item) => !item.isDeleted);

  res.status(200).json({
    items: activeUsers.map(toUserResponseDto),
  });
});

usersRouter.get(
  "/:id",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseId(req.params.id);
      const user = getUsers().find(
        (item) => item.id === id && !item.isDeleted,
      );

      if (!user) {
        throw new ApiError(404, "NOT_FOUND", "Користувача не знайдено.");
      }

      res.status(200).json(toUserResponseDto(user));
    } catch (error) {
      next(error);
    }
  },
);

usersRouter.post("/", (req: Request, res: Response, next: NextFunction) => {
  try {
    const dto = normalizeCreateUserRequestDto(req.body);
    const validationErrors = validateCreateUserRequestDto(dto);

    if (validationErrors.length > 0) {
      throw new ApiError(
        400,
        "VALIDATION_ERROR",
        "Некоректні дані користувача.",
        validationErrors,
      );
    }

    const newUser: User = {
      id: allocateUserId(),
      ...dto,
      isDeleted: false,
    };

    getUsers().push(newUser);

    res.status(201).json(toUserResponseDto(newUser));
  } catch (error) {
    next(error);
  }
});

usersRouter.put(
  "/:id",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseId(req.params.id);
      const dto = normalizeUpdateUserRequestDto(req.body);
      const validationErrors = validateUpdateUserRequestDto(dto);

      if (validationErrors.length > 0) {
        throw new ApiError(
          400,
          "VALIDATION_ERROR",
          "Некоректні дані користувача.",
          validationErrors,
        );
      }

      const users = getUsers();
      const index = users.findIndex(
        (item) => item.id === id && !item.isDeleted,
      );

      if (index === -1) {
        throw new ApiError(404, "NOT_FOUND", "Користувача не знайдено.");
      }

      const updatedUser: User = {
        id,
        ...dto,
        isDeleted: false,
      };

      users[index] = updatedUser;

      res.status(200).json(toUserResponseDto(updatedUser));
    } catch (error) {
      next(error);
    }
  },
);

usersRouter.delete(
  "/:id",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseId(req.params.id);
      const users = getUsers();
      const user = users.find((item) => item.id === id && !item.isDeleted);

      if (!user) {
        throw new ApiError(404, "NOT_FOUND", "Користувача не знайдено.");
      }

      user.isDeleted = true;

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);