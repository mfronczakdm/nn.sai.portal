export class SitecoreFetchError extends Error {
  readonly status?: number;
  readonly details?: unknown;

  constructor(message: string, options?: { status?: number; details?: unknown; cause?: unknown }) {
    super(message);
    this.name = 'SitecoreFetchError';
    this.status = options?.status;
    this.details = options?.details;
    if (options?.cause !== undefined) {
      (this as Error & { cause?: unknown }).cause = options.cause;
    }
  }
}

export class SitecoreConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SitecoreConfigError';
  }
}

export class SitecoreValidationError extends SitecoreFetchError {
  constructor(message: string, details?: unknown) {
    super(message, { details });
    this.name = 'SitecoreValidationError';
  }
}
