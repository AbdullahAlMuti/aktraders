export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  errors?: Record<string, string[]>;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  error?: string;
  errors?: Record<string, string[]>;
}
