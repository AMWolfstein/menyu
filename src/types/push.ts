import type { Timestamp } from "firebase/firestore";

export type PushSubscriptionRecord = {
  id: string;
  endpoint: string;
  keys: { p256dh: string; auth: string };
  createdAt?: Timestamp;
};
