export type OrderEvent = {
  _id?: string;
  lab_order_id: number; 
  event_type: string;   
  source: string;       
  note?: string;
  created_at?: string;
};