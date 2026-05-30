import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import {
  countAccessRequests,
  createAccessRequest,
  listAccessRequests,
  listAccessRequestsWithUsers,
  replaceAccessRequest,
  searchAccessRequestsByComment,
  softDeleteAccessRequest,
} from "../data/access-requests.store.js";
import { ApiError } from "../errors/api-error.js";
import { demoAuth } from "../middleware/demo-auth.js";
import { toAccessRequestResponseDto } from "../mappers/access-request.mapper.js";
import {
  getCurrentUserId,
  rejectClientProvidedAccessRequestOwner,
  requireOwnedAccessRequest,
} from "../security/access-request-access.js";
import type { AccessRequest } from "../types/access-request.js";
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

accessRequestsRouter.use(demoAuth);

accessRequestsRouter.get(
  "/stats/count",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentUserId = getCurrentUserId(req);
      const status = parseStatusFilter(req.query.status);
      const total = await countAccessRequests(status, currentUserId);

      res.status(200).json({
        data: {
          total,
          status,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

accessRequestsRouter.get(
  "/with-users",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentUserId = getCurrentUserId(req);
      const status = parseStatusFilter(req.query.status);
      const rawLimit =
        typeof req.query.limit === "string" ? Number(req.query.limit) : 10;
      const limit = Number.isFinite(rawLimit) ? rawLimit : 10;

      const items = await listAccessRequestsWithUsers(
        status,
        limit,
        currentUserId,
      );

      res.status(200).json({
        items,
        meta: {
          count: items.length,
          status,
          limit: Math.min(Math.max(Math.trunc(limit), 1), 100),
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

accessRequestsRouter.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentUserId = getCurrentUserId(req);
      const status = parseStatusFilter(req.query.status);
      const allItems = await listAccessRequests(currentUserId);

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
  "/search",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentUserId = getCurrentUserId(req);
      const q = typeof req.query.q === "string" ? req.query.q : "";

      const items = await searchAccessRequestsByComment(q, currentUserId);

      res.status(200).json({
        items: items.map(toAccessRequestResponseDto),
        meta: {
          count: items.length,
          q,
        },
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
      const currentUserId = getCurrentUserId(req);
      const id = parseId(req.params.id);
      const accessRequest = await requireOwnedAccessRequest(id, currentUserId);

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
      const currentUserId = getCurrentUserId(req);
      rejectClientProvidedAccessRequestOwner(req.body);

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

      const created = await createAccessRequest({
        ...dto,
        userId: currentUserId,
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
      const currentUserId = getCurrentUserId(req);
      const id = parseId(req.params.id);
      const accessRequest = await requireOwnedAccessRequest(id, currentUserId);

      rejectClientProvidedAccessRequestOwner(req.body);

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

      const updated = await replaceAccessRequest(
        {
          ...accessRequest,
          ...dto,
        },
        currentUserId,
      );

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
      const currentUserId = getCurrentUserId(req);
      const id = parseId(req.params.id);
      const accessRequest = await requireOwnedAccessRequest(id, currentUserId);

      rejectClientProvidedAccessRequestOwner(req.body);

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

      const merged: AccessRequest = {
        ...accessRequest,
        ...patchDto,
      };

      const durationErrors = validateUpdateAccessRequestRequestDto({
        startDateTime: merged.startDateTime,
        endDateTime: merged.endDateTime,
        comments: merged.comments,
        status: merged.status,
      });

      if (durationErrors.length > 0) {
        throw new ApiError(
          400,
          "VALIDATION_ERROR",
          "Некоректні дані заявки.",
          durationErrors,
        );
      }

      const updated = await replaceAccessRequest(merged, currentUserId);

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
      const currentUserId = getCurrentUserId(req);
      const id = parseId(req.params.id);

      await requireOwnedAccessRequest(id, currentUserId);

      const deleted = await softDeleteAccessRequest(id, currentUserId);

      if (!deleted) {
        throw new ApiError(404, "NOT_FOUND", "Заявку не знайдено.");
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);
