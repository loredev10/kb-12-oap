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
import type { AccessRequest } from "../types/access-request.js";
import { parseId } from "../utils/parse-id.js";
import {
  normalizeCreateAccessRequestRequestDto,
  normalizeUpdateAccessRequestRequestDto,
  validateCreateAccessRequestRequestDto,
  validateUpdateAccessRequestRequestDto,
} from "../validators/access-request.validator.js";

export const accessRequestsRouter = Router();

accessRequestsRouter.get("/", (_req: Request, res: Response) => {
  const activeAccessRequests = getAccessRequests().filter(
    (item) => !item.isDeleted,
  );

  res.status(200).json({
    items: activeAccessRequests.map(toAccessRequestResponseDto),
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

accessRequestsRouter.delete(
  "/:id",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseId(req.params.id);
      const accessRequests = getAccessRequests();
      const accessRequest = accessRequests.find(
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