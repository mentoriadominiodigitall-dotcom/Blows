export class AppError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status = 400) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
  }
}

export function publicError(error: unknown): never {
  if (error instanceof AppError) throw error;
  console.error("[reviva]", error);
  throw new AppError("INTERNAL", "Não foi possível concluir a operação.", 500);
}

export function isUnauthorized(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { status?: number; message?: string };
  return e.status === 401 || e.message === "Unauthorized";
}
