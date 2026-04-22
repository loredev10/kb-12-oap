import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import {
  createUser,
  findUserById,
  listUsers,
  patchUser,
  replaceUser,
  softDeleteUser,
} from "../data/users.store.js";
import { ApiError } from "../errors/api-error.js";
import { toUserResponseDto } from "../mappers/user.mapper.js";
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

usersRouter.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const status = parseStatusFilter(req.query.status);
      const allUsers = await listUsers();

      let items = allUsers;

      if (status === "active") {
        items = allUsers.filter((item) => !item.isDeleted);
      } else if (status === "deleted") {
        items = allUsers.filter((item) => item.isDeleted);
      }

      res.status(200).json({
        items: items.map(toUserResponseDto),
      });
    } catch (error) {
      next(error);
    }
  },
);

usersRouter.get(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseId(req.params.id);
      const user = await findUserById(id);

      if (!user || user.isDeleted) {
        throw new ApiError(404, "NOT_FOUND", "Користувача не знайдено.");
      }

      res.status(200).json(toUserResponseDto(user));
    } catch (error) {
      next(error);
    }
  },
);

usersRouter.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
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

      const created = await createUser(dto);

      res.status(201).json(toUserResponseDto(created));
    } catch (error) {
      next(error);
    }
  },
);

usersRouter.put(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
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

      const updated = await replaceUser({
        id,
        ...dto,
        isDeleted: false,
      });

      if (!updated) {
        throw new ApiError(404, "NOT_FOUND", "Користувача не знайдено.");
      }

      res.status(200).json(toUserResponseDto(updated));
    } catch (error) {
      next(error);
    }
  },
);

usersRouter.patch(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
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

      const updated = await patchUser(id, patchDto);

      if (!updated) {
        throw new ApiError(404, "NOT_FOUND", "Користувача не знайдено.");
      }

      res.status(200).json(toUserResponseDto(updated));
    } catch (error) {
      next(error);
    }
  },
);

usersRouter.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseId(req.params.id);
      const deleted = await softDeleteUser(id);

      if (!deleted) {
        throw new ApiError(404, "NOT_FOUND", "Користувача не знайдено.");
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);