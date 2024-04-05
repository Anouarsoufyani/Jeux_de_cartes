interface registerResponseDto {
  success: boolean;
  errors?: {
    username?: string;
    email?: string;
    password?: string;
  };
}

export default registerResponseDto;
