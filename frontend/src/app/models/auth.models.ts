export interface LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

export interface LoginResponse {
  token: string;
  userId: number;
  expiresIn: number;
}

export interface User {
  LastName: string;
  accessToken: string;
  accountId: number;
  brandEnabledAccount: boolean;
  firstName: string;
  jobTitle: string;
  loginId: string;
  message: string;
  roleId: number;
  status: string;
  userId: number;
  userName: string;
  role: string;
  userType: string;
  branding?: Branding;
}

export interface Branding {
  bannerBackgroundColor?: string;
  bannerTextColor?: string;
  primaryButtonsBackgroundColor?: string;
  primaryButtonsTextColor?: string;
  actionButtonTextColor?: string;
  actionButtonBackgroundColor?: string;
  mainLogo?: string;
  platformName?: string;
  id?: number
}
