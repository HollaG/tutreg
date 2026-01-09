export enum UserEvent {
  SWAP_CREATED,
  SWAP_REQUESTED_COMPLETED,
  SWAP_CREATED_COMPLETED,
}

export interface SendMessageRequest {
  t_id: number;
  swap_id: number;
  name: string;
  event: UserEvent; // TODO: Replace with UserEvent type later
}
