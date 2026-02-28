import { http } from "./http";

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type Order = {
  id: number;
  test: number;              // FK
  test_name?: string;       // solo lectura (opcional)
  customer_name: string;
  seats: number;
  status: "RESERVED" | "CONFIRMED" | "CANCELLED";
  created_at?: string;
};

// Payload para crear (normalmente no envías id, test_name, created_at)
export type CreateOrderPayload = {
  test: number;
  customer_name: string;
  seats: number;
  status: "RESERVED" | "CONFIRMED" | "CANCELLED";
};

export async function listOrdersPublicApi() {
  const { data } = await http.get<Paginated<Order>>("/api/Orders/");
  return data; // { ... , results: [] }
}

export async function listOrdersAdminApi() {
  const { data } = await http.get<Paginated<Order>>("/api/Orders/");
  return data;
}

export async function createOrderApi(payload: Omit<Order, "id">) {
  const { data } = await http.post<Order>("/api/Orders/", payload);
  return data;
}

export async function updateOrderApi(id: number, payload: Partial<Order>) {
  const { data } = await http.put<Order>(`/api/Orders/${id}/`, payload);
  return data;
}

export async function deleteOrderApi(id: number) {
  await http.delete(`/api/Orders/${id}/`);
}