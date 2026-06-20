export const USER_ROLES = ["STUDENT", "ALUMNI", "ADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = ["ENROLLED", "GRADUATED", "WITHDRAWN"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];
