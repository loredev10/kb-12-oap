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
import type { PatchUserRequestDto, User } from "../types/user.js";
import { parseId } from "../utils/parse-id.js";
import { parseStatusFilter } from "../utils/status-filter.js";
import {
  normalizeCreateUserRequestDto,
  normalizePatchUserRequestDto,
  normalizeUpdateUserRequestDto,
  validateCreateUserRequestDto,
  validatePatchUserRequestDto,
  validateUpdateUserRequestDto,
} from "../validators/user.validator.js";

export const usersRouter = Router();

usersRouter.get("/", (req: Request, res: Response) => {
  const status = parseStatusFilter(req.query.status);
  const allUsers = getUsers();

  let items = allUsers;

  if (status === "active") {
    items = allUsers.filter((item) => !item.isDeleted);
  } else if (status === "deleted") {
    items = allUsers.filter((item) => item.isDeleted);
  }

  res.status(200).json({
    items: items.map(toUserResponseDto),
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
});

usersRouter.patch("/:id", (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseId(req.params.id);
    const patchDto = normalizePatchUserRequestDto(req.body);
    const validationErrors = validatePatchUserRequestDto(patchDto);

    if (validationErrors.length > 0) {
      throw new ApiError(
        400,
        "VALIDATION_ERROR",
        "Некоректні дані користувача.",
        validationErrors,
      );
    }

    const users = getUsers();
    const user = users.find((item) => item.id === id);

    if (!user) {
      throw new ApiError(404, "NOT_FOUND", "Користувача не знайдено.");
    }

    const nextUser: User = {
      ...user,
      ...(patchDto as PatchUserRequestDto),
    };

    Object.assign(user, nextUser);

    res.status(200).json(toUserResponseDto(user));
  } catch (error) {
    next(error);
  }
});

usersRouter.delete(
  "/:id",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseId(req.params.id);
      const user = getUsers().find((item) => item.id === id && !item.isDeleted);

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
