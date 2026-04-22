import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import {
  createAccessRequest,
  findAccessRequestById,
  listAccessRequests,
  replaceAccessRequest,
  softDeleteAccessRequest,
} from "../data/access-requests.store.js";
import { listUsers } from "../data/users.store.js";
import { ApiError } from "../errors/api-error.js";
import { toAccessRequestResponseDto } from "../mappers/access-request.mapper.js";
import type {
  AccessRequest,
  PatchAccessRequestRequestDto,
} from "../types/access-request.js";
import { parseId } from "../utils/parse-id.js";
import { parseStatusFilter } from "../utils/status-filter.js";
import {
  normalizeCreateAccessRequestRequestDto,
  normalizePatchAccessRequestRequestDto,
  normalizeUpdateAccessRequestRequestDto,
  validateCreateAccessRequestRequestDto,
  validatePatchAccessRequestRequestDto,
  validateUpdateAccessRequestRequestDto,
} from "../validators/access-request.validator.js";

export const accessRequestsRouter = Router();

accessRequestsRouter.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const status = parseStatusFilter(req.query.status);
      const allItems = await listAccessRequests();

      let items = allItems;

      if (status === "active") {
        items = allItems.filter((item) => !item.isDeleted);
      } else if (status === "deleted") {
        items = allItems.filter((item) => item.isDeleted);
      }

      res.status(200).json({
        items: items.map(toAccessRequestResponseDto),
      });
    } catch (error) {
      next(error);
    }
  },
);

accessRequestsRouter.get(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseId(req.params.id);
      const accessRequest = await findAccessRequestById(id);

      if (!accessRequest || accessRequest.isDeleted) {
        throw new ApiError(404, "NOT_FOUND", "Заявку не знайдено.");
      }

      res.status(200).json(toAccessRequestResponseDto(accessRequest));
    } catch (error) {
      next(error);
    }
  },
);

accessRequestsRouter.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = normalizeCreateAccessRequestRequestDto(req.body);
      const validationErrors = validateCreateAccessRequestRequestDto(dto);

      if (validationErrors.length > 0) {
        throw new ApiError(
          400,
          "VALIDATION_ERROR",
          "Некоректні дані заявки.",
          validationErrors,
        );
      }

      const users = await listUsers();
      const userExists = users.some(
        (user) => user.id === dto.userId && !user.isDeleted,
      );

      if (!userExists) {
        throw new ApiError(400, "USER_NOT_FOUND", "Користувача не знайдено.");
      }

      const created = await createAccessRequest({
        ...dto,
        isDeleted: false,
      });

      res.status(201).json(toAccessRequestResponseDto(created));
    } catch (error) {
      next(error);
    }
  },
);

accessRequestsRouter.put(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseId(req.params.id);
      const dto = normalizeUpdateAccessRequestRequestDto(req.body);
      const validationErrors = validateUpdateAccessRequestRequestDto(dto);

      if (validationErrors.length > 0) {
        throw new ApiError(
          400,
          "VALIDATION_ERROR",
          "Некоректні дані заявки.",
          validationErrors,
        );
      }

      const users = await listUsers();
      const userExists = users.some(
        (user) => user.id === dto.userId && !user.isDeleted,
      );

      if (!userExists) {
        throw new ApiError(400, "USER_NOT_FOUND", "Користувача не знайдено.");
      }

      const updated = await replaceAccessRequest({
        id,
        ...dto,
        isDeleted: false,
      });

      if (!updated) {
        throw new ApiError(404, "NOT_FOUND", "Заявку не знайдено.");
      }

      res.status(200).json(toAccessRequestResponseDto(updated));
    } catch (error) {
      next(error);
    }
  },
);

accessRequestsRouter.patch(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseId(req.params.id);
      const patchDto = normalizePatchAccessRequestRequestDto(req.body);
      const validationErrors = validatePatchAccessRequestRequestDto(patchDto);

      if (validationErrors.length > 0) {
        throw new ApiError(
          400,
          "VALIDATION_ERROR",
          "Некоректні дані заявки.",
          validationErrors,
        );
      }

      const accessRequest = await findAccessRequestById(id);

      if (!accessRequest) {
        throw new ApiError(404, "NOT_FOUND", "Заявку не знайдено.");
      }

      const merged: AccessRequest = {
        ...accessRequest,
        ...(patchDto as PatchAccessRequestRequestDto),
      };

      const users = await listUsers();
      const userExists = users.some(
        (user) => user.id === merged.userId && !user.isDeleted,
      );

      if (!userExists) {
        throw new ApiError(400, "USER_NOT_FOUND", "Користувача не знайдено.");
      }

      const durationErrors = validateUpdateAccessRequestRequestDto({
        userId: merged.userId,
        startDateTime: merged.startDateTime,
        endDateTime: merged.endDateTime,
        comments: merged.comments,
      });

      if (durationErrors.length > 0) {
        throw new ApiError(
          400,
          "VALIDATION_ERROR",
          "Некоректні дані заявки.",
          durationErrors,
        );
      }

      const updated = await replaceAccessRequest(merged);

      if (!updated) {
        throw new ApiError(404, "NOT_FOUND", "Заявку не знайдено.");
      }

      res.status(200).json(toAccessRequestResponseDto(updated));
    } catch (error) {
      next(error);
    }
  },
);

accessRequestsRouter.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseId(req.params.id);
      const deleted = await softDeleteAccessRequest(id);

      if (!deleted) {
        throw new ApiError(404, "NOT_FOUND", "Заявку не знайдено.");
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);