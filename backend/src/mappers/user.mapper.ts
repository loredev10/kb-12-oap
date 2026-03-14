import type { User, UserResponseDto } from "../types/user.js";

export function toUserResponseDto(user: User): UserResponseDto {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    notes: user.notes,
  };
}