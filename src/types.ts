export interface ContactBody {
  email: string;
  message: string;
  subject?: string;
  name?: string;
  fax_number?: string;
}

export interface EmailPayload {
  from: string;
  to: string[];
  replyTo: string;
  subject: string;
  text: string;
}

export interface EmailProvider {
  readonly id: string;
  send(body: EmailPayload): Promise<void>;
}
