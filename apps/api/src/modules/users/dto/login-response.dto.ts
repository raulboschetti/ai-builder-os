export class LoginResponseDto {
  accessToken!: string;

  refreshToken!: string;

  user!: {
    id: string;
    name: string | null;
    email: string;
  };
}