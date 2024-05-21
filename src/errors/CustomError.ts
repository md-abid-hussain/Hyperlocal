export interface CustomErrorContent {
  message: string;
  context?: Record<string, string | number | string[]>;
}

export abstract class CustomError extends Error {
  abstract readonly statusCode: number;
  abstract readonly errors: CustomErrorContent[];
  abstract readonly logging: boolean;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

export class BadRequestError extends CustomError {
  private static readonly _statusCode = 400;
  private readonly _code: number;
  private readonly _logging: boolean;
  private readonly _context: Record<string, string | number | string[]>;

  constructor(params?: {
    code?: number;
    message?: string;
    logging?: boolean;
    context?: Record<string, string | number | string[]>;
  }) {
    const { code, message, logging } = params ?? {};

    super(message ?? 'Bad request');
    this._code = code ?? BadRequestError._statusCode;
    this._logging = logging ?? true;
    this._context = params?.context ?? {};

    Object.setPrototypeOf(this, BadRequestError.prototype);
  }

  get errors(): CustomErrorContent[] {
    return [{ message: this.message, context: this._context }];
  }

  get statusCode(): number {
    return this._code;
  }

  get logging(): boolean {
    return this._logging;
  }

  get context(): Record<string, string | number | string[]> {
    return this._context;
  }
}
