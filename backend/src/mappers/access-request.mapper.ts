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
    startDateTime: accessRequest.startDateTime,
    endDateTime: accessRequest.endDateTime,
    comments: accessRequest.comments,
  };
}