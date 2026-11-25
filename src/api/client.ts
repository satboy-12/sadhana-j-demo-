export type ApiErrorCode =
  | 'BACKEND_UNAVAILABLE'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'SERVER_ERROR';

export class ApiError extends Error {
  public readonly code: ApiErrorCode;
  public readonly status: number;
  public readonly endpoint: string;
  public readonly method: string;
  public readonly fieldErrors?: Record<string, string>;

  constructor(params: {
    message: string;
    code: ApiErrorCode;
    status: number;
    endpoint: string;
    method: string;
    fieldErrors?: Record<string, string>;
  }) {
    super(params.message);
    this.name = 'ApiError';
    this.code = params.code;
    this.status = params.status;
    this.endpoint = params.endpoint;
    this.method = params.method;
    this.fieldErrors = params.fieldErrors;
  }
}
