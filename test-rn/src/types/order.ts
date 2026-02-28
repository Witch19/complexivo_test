export type Order = {
  id: number;
  test_id: number;          // o show_id según serializer
  patient_name : string;
  status: string;
  result_summary ?: string; 
  created_at: string;
};