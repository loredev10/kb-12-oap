import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import {
  allocateUserId,
  getUsers,
  recomputeNextUserId,
} from "../data/users.store.js";
import { ApiError } from "../errors/api-error.js";
import { toUserResponseDto } from "../mappers/user.mapper.js";
import type { User } from "../types/user.js";
import { parseId } from "../utils/parse-id.js";
import {
  normalizeUserDto,
  validateUserDto,
} from "../validators/user.validator.js";

export const usersRouter = Router();

usersRouter.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    items: getUsers().map(toUserResponseDto),
  });
});

usersRouter.get(
  "/:id",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseId(req.params.id);
      const user = getUsers().find((item) => item.id === id);

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
      id: allocateUserId(),
      ...dto,
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

      const users = getUsers();
      const index = users.findIndex((item) => item.id === id);

      if (index === -1) {
        throw new ApiError(404, "NOT_FOUND", "Користувача не знайдено.");
      }

      const updatedUser: User = {
        id,
        ...dto,
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
      const index = users.findIndex((item) => item.id === id);

      if (index === -1) {
        throw new ApiError(404, "NOT_FOUND", "Користувача не знайдено.");
      }

      users.splice(index, 1);
      recomputeNextUserId();

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);