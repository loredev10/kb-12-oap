import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import {
  allocateAccessRequestId,
  getAccessRequests,
} from "../data/access-requests.store.js";
import { getUsers } from "../data/users.store.js";
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

accessRequestsRouter.get("/", (req: Request, res: Response) => {
  const status = parseStatusFilter(req.query.status);
  const allItems = getAccessRequests();

  let items = allItems;

  if (status === "active") {
    items = allItems.filter((item) => !item.isDeleted);
  } else if (status === "deleted") {
    items = allItems.filter((item) => item.isDeleted);
  }

  res.status(200).json({
    items: items.map(toAccessRequestResponseDto),
  });
});

accessRequestsRouter.get(
  "/:id",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseId(req.params.id);
      const accessRequest = getAccessRequests().find(
        (item) => item.id === id && !item.isDeleted,
      );

      if (!accessRequest) {
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
  (req: Request, res: Response, next: NextFunction) => {
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

      const userExists = getUsers().some(
        (user) => user.id === dto.userId && !user.isDeleted,
      );

      if (!userExists) {
        throw new ApiError(400, "USER_NOT_FOUND", "Користувача не знайдено.");
      }

      const newAccessRequest: AccessRequest = {
        id: allocateAccessRequestId(),
        ...dto,
        isDeleted: false,
      };

      getAccessRequests().push(newAccessRequest);

      res.status(201).json(toAccessRequestResponseDto(newAccessRequest));
    } catch (error) {
      next(error);
    }
  },
);

accessRequestsRouter.put(
  "/:id",
  (req: Request, res: Response, next: NextFunction) => {
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

      const userExists = getUsers().some(
        (user) => user.id === dto.userId && !user.isDeleted,
      );

      if (!userExists) {
        throw new ApiError(400, "USER_NOT_FOUND", "Користувача не знайдено.");
      }

      const accessRequests = getAccessRequests();
      const index = accessRequests.findIndex(
        (item) => item.id === id && !item.isDeleted,
      );

      if (index === -1) {
        throw new ApiError(404, "NOT_FOUND", "Заявку не знайдено.");
      }

      const updatedAccessRequest: AccessRequest = {
        id,
        ...dto,
        isDeleted: false,
      };

      accessRequests[index] = updatedAccessRequest;

      res.status(200).json(toAccessRequestResponseDto(updatedAccessRequest));
    } catch (error) {
      next(error);
    }
  },
);

accessRequestsRouter.patch(
  "/:id",
  (req: Request, res: Response, next: NextFunction) => {
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

      const accessRequest = getAccessRequests().find((item) => item.id === id);

      if (!accessRequest) {
        throw new ApiError(404, "NOT_FOUND", "Заявку не знайдено.");
      }

      const merged: AccessRequest = {
        ...accessRequest,
        ...(patchDto as PatchAccessRequestRequestDto),
      };

      const userExists = getUsers().some(
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

      Object.assign(accessRequest, merged);

      res.status(200).json(toAccessRequestResponseDto(accessRequest));
    } catch (error) {
      next(error);
    }
  },
);

accessRequestsRouter.delete(
  "/:id",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseId(req.params.id);
      const accessRequest = getAccessRequests().find(
        (item) => item.id === id && !item.isDeleted,
      );

      if (!accessRequest) {
        throw new ApiError(404, "NOT_FOUND", "Заявку не знайдено.");
      }

      accessRequest.isDeleted = true;

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);
