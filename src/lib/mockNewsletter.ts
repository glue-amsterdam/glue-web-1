export interface NewsLetterType {
  id: string;
  email: string;
  name?: string;
  subscribed_at: Date;
  status: "subscribed" | "unsubscribed";
}

export const mockNewsletter = {};
