import type {
  AccessRequest,
  AccessRequestResponseDto,
} from "../types/access-request.js";

export function toAccessRequestResponseDto(
  accessRequest: AccessRequest,
): AccessRequestResponseDto {
  return {
    id: accessRequest.id,
    userId: accessRequest.userId,
    date: accessRequest.date,
    comments: accessRequest.comments,
  };
}