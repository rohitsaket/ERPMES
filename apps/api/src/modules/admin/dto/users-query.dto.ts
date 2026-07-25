export class UsersQueryDto {
  page?: number = 1;
  limit?: number = 20;
  search?: string;
  status?: string;
  role?: string;
}
