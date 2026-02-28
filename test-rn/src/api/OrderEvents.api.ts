import { http } from "./http";
import type { OrderEvent } from "../types/OrderEvent";
import type { Paginated } from "../types/drf";

export type OrderEventCreatePayload = {
  lab_order_id: number; 
  event_type: string;   
  source: "MOBILE";      
  note?: string;
};

export async function listOrderEventsApi(): Promise<Paginated<OrderEvent> | OrderEvent[]> {
  const { data } = await http.get<Paginated<OrderEvent> | OrderEvent[]>("/api/order-events/");
  return data;
}

export async function createOrderEventApi(payload: OrderEventCreatePayload): Promise<OrderEvent> {
  const { data } = await http.post<OrderEvent>("/api/order-events/", payload);
  return data;
}

export async function deleteOrderEventApi(id: string): Promise<void> {
  await http.delete(`/api/order-events/${id}/`);
}

