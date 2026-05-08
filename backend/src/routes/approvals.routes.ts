import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import {
  createApproval,
  findApprovalById,
  listApprovals,
  patchApproval,
  replaceApproval,
  softDeleteApproval,
} from "../data/approvals.store.js";
import { findAccessRequestById } from "../data/access-requests.store.js";
import { findUserById } from "../data/users.store.js";
import { ApiError } from "../errors/api-error.js";
import { toApprovalResponseDto } from "../mappers/approval.mapper.js";
import { parseId } from "../utils/parse-id.js";
import { parseStatusFilter } from "../utils/status-filter.js";
import {
  normalizeCreateApprovalRequestDto,
  normalizePatchApprovalRequestDto,
  normalizeUpdateApprovalRequestDto,
  validateCreateApprovalRequestDto,
  validatePatchApprovalRequestDto,
  validateUpdateApprovalRequestDto,
} from "../validators/approval.validator.js";

export const approvalsRouter = Router();

approvalsRouter.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const status = parseStatusFilter(req.query.status);
      const allItems = await listApprovals();

      let items = allItems;

      if (status === "active") {
        items = allItems.filter((item) => !item.isDeleted);
      } else if (status === "deleted") {
        items = allItems.filter((item) => item.isDeleted);
      }

      res.status(200).json({
        items: items.map(toApprovalResponseDto),
      });
    } catch (error) {
      next(error);
    }
  },
);

approvalsRouter.get(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseId(req.params.id);
      const approval = await findApprovalById(id);

      if (!approval || approval.isDeleted) {
        throw new ApiError(404, "NOT_FOUND", "Рішення не знайдено.");
      }

      res.status(200).json(toApprovalResponseDto(approval));
    } catch (error) {
      next(error);
    }
  },
);

approvalsRouter.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = normalizeCreateApprovalRequestDto(req.body);
      const validationErrors = validateCreateApprovalRequestDto(dto);

      if (validationErrors.length > 0) {
        throw new ApiError(
          400,
          "VALIDATION_ERROR",
          "Некоректні дані рішення.",
          validationErrors,
        );
      }

      const accessRequest = await findAccessRequestById(dto.accessRequestId);
      if (!accessRequest || accessRequest.isDeleted) {
        throw new ApiError(
          400,
          "ACCESS_REQUEST_NOT_FOUND",
          "Заявку не знайдено.",
        );
      }

      const approvedByUser = await findUserById(dto.approvedByUserId);
      if (!approvedByUser || approvedByUser.isDeleted) {
        throw new ApiError(
          400,
          "USER_NOT_FOUND",
          "Користувача, що ухвалює рішення, не знайдено.",
        );
      }

      const created = await createApproval(dto);

      res.status(201).json(toApprovalResponseDto(created));
    } catch (error) {
      next(error);
    }
  },
);

approvalsRouter.put(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseId(req.params.id);
      const dto = normalizeUpdateApprovalRequestDto(req.body);
      const validationErrors = validateUpdateApprovalRequestDto(dto);

      if (validationErrors.length > 0) {
        throw new ApiError(
          400,
          "VALIDATION_ERROR",
          "Некоректні дані рішення.",
          validationErrors,
        );
      }

      const accessRequest = await findAccessRequestById(dto.accessRequestId);
      if (!accessRequest || accessRequest.isDeleted) {
        throw new ApiError(
          400,
          "ACCESS_REQUEST_NOT_FOUND",
          "Заявку не знайдено.",
        );
      }

      const approvedByUser = await findUserById(dto.approvedByUserId);
      if (!approvedByUser || approvedByUser.isDeleted) {
        throw new ApiError(
          400,
          "USER_NOT_FOUND",
          "Користувача, що ухвалює рішення, не знайдено.",
        );
      }

      const updated = await replaceApproval({
        id,
        ...dto,
        isDeleted: false,
      });

      if (!updated) {
        throw new ApiError(404, "NOT_FOUND", "Рішення не знайдено.");
      }

      res.status(200).json(toApprovalResponseDto(updated));
    } catch (error) {
      next(error);
    }
  },
);

approvalsRouter.patch(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseId(req.params.id);
      const patchDto = normalizePatchApprovalRequestDto(req.body);
      const validationErrors = validatePatchApprovalRequestDto(patchDto);

      if (validationErrors.length > 0) {
        throw new ApiError(
          400,
          "VALIDATION_ERROR",
          "Некоректні дані рішення.",
          validationErrors,
        );
      }

      const current = await findApprovalById(id);
      if (!current) {
        throw new ApiError(404, "NOT_FOUND", "Рішення не знайдено.");
      }

      const nextApproval = {
        ...current,
        ...patchDto,
      };

      const accessRequest = await findAccessRequestById(
        nextApproval.accessRequestId,
      );
      if (!accessRequest || accessRequest.isDeleted) {
        throw new ApiError(
          400,
          "ACCESS_REQUEST_NOT_FOUND",
          "Заявку не знайдено.",
        );
      }

      const approvedByUser = await findUserById(nextApproval.approvedByUserId);
      if (!approvedByUser || approvedByUser.isDeleted) {
        throw new ApiError(
          400,
          "USER_NOT_FOUND",
          "Користувача, що ухвалює рішення, не знайдено.",
        );
      }

      const updated = await patchApproval(id, patchDto);

      if (!updated) {
        throw new ApiError(404, "NOT_FOUND", "Рішення не знайдено.");
      }

      res.status(200).json(toApprovalResponseDto(updated));
    } catch (error) {
      next(error);
    }
  },
);

approvalsRouter.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseId(req.params.id);
      const deleted = await softDeleteApproval(id);

      if (!deleted) {
        throw new ApiError(404, "NOT_FOUND", "Рішення не знайдено.");
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);