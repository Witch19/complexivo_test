import { http } from "./http";
    
export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type Tests = { id: number; movie_title: string };

export async function listTestsApi() {
  const { data } = await http.get<Paginated<Tests>>("/api/Tests/");
  return data; // { count, next, previous, results }
}

export async function createTestApi(nombre: string) {
  const { data } = await http.post<Tests>("/api/Tests/", { nombre });
  return data;
}

export async function updateTestApi(id: number, nombre: string) {
  const { data } = await http.put<Tests>(`/api/Tests/${id}/`, { nombre });
  return data;
}

export async function deleteTestApi(id: number) {
  await http.delete(`/api/Tests/${id}/`);
}