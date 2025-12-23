export interface ProfileDto {
  userId: string;
  profileName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  description: string | null;
  skills: string[] | null;
  socialLinks: SocialLinkDto[] | null;
}

export interface SocialLinkDto {
  platform: string | null;
  url: string | null;
}

export interface UpdateProfileRequest {
  profileName?: string | null;
  bio?: string | null;
  description?: string | null;
  skills?: string[] | null;
  socialLinks?: SocialLinkDto[] | null;
}

export interface GetUsersResult {
  items: AdminProfileDto[];
  totalCount: number;
}

export interface AdminProfileDto {
  user: User;
  profileName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  description: string | null;
  skills: string[] | null;
  socialLinks: SocialLinkDto[] | null;
}

export interface ExternalLogin {
  provider: string;
  email: string;
}

export interface User {
  id: string;
  email: string;
  role: string;
  passwordHash?: string;
  passwordResetCode?: string;
  passwordResetCodeExpiry?: string;
  emailConfirmationCode?: string;
  emailConfirmationCodeExpiry?: string;
  emailConfirmedAt?: string;
  externalLogins: ExternalLogin[];
  createdAt: string;
}
