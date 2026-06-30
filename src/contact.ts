export interface ContactRequest {
  method: string;
  headers: Record<string, string | undefined>;
  body: unknown;
}

export interface ContactResult {
  status: number;
  body: unknown;
}
