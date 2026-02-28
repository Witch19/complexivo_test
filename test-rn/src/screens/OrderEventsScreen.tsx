import { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, FlatList, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";

import { listOrderApi } from "../api/order.api";
import { listOrderEventsApi, createOrderEventApi, deleteOrderEventApi } from "../api/OrderEvents.api";
import { listCatalogTypesApi } from "../api/CatalogTypes.api";
import type { Order } from "../types/order";
import type { CatalogType } from "../types/CatalogType";
import type { OrderEvent } from "../types/OrderEvent";
import { toArray } from "../types/drf";

// 1. Los tipos de examen vienen de PostgreSQL (lab_tests)
function CatalogTypeLabel(st: CatalogType): string {
  return st.test_name || "Sin nombre";
}

export default function OrderEventsScreen() {
  const [events, setEvents] = useState<OrderEvent[]>([]); // De MongoDB
  const [orders, setOrders] = useState<Order[]>([]);      // De PostgreSQL
  const [catalogTypes, setCatalogTypes] = useState<CatalogType[]>([]); // De PostgreSQL

  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [selectedEventType, setSelectedEventType] = useState<string>("CREATED");

  const [note, setNote] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Mapas para cruzar datos de Postgres en la lista de Mongo
  const orderById = useMemo(() => {
    const map = new Map<number, Order>();
    orders.forEach((v) => map.set(v.id, v));
    return map;
  }, [orders]);

  const loadAll = async (): Promise<void> => {
    try {
      setErrorMessage("");
      const [eventsData, ordersData, catalogData] = await Promise.all([
        listOrderEventsApi(), // MongoDB
        listOrderApi(),       // PostgreSQL
        listCatalogTypesApi(), // PostgreSQL
      ]);

      const eventsList = toArray(eventsData);
      const ordersList = toArray(ordersData);
      const catalogList = toArray(catalogData);

      setEvents(eventsList);
      setOrders(ordersList);
      setCatalogTypes(catalogList);

      if (selectedOrderId === null && ordersList.length) setSelectedOrderId(ordersList[0].id);
    } catch {
      setErrorMessage("Error de conexión. Verifique PostgreSQL y MongoDB.");
    }
  };

  useEffect(() => { loadAll(); }, []);

  const createEvent = async (): Promise<void> => {
    try {
      setErrorMessage("");
      if (selectedOrderId === null) return setErrorMessage("Seleccione una orden");

      // 2. Enviamos el esquema exacto que pide tu colección de MongoDB
      const created = await createOrderEventApi({
        lab_order_id: selectedOrderId, // FK a PostgreSQL
        event_type: selectedEventType, // CREATED, PROCESSING, etc.
        source: "MOBILE",              // Valor definido en tu esquema
        note: note.trim() || undefined,
      });

      setEvents((prev) => [created, ...prev]);
      setNote("");
    } catch {
      setErrorMessage("No se pudo registrar en MongoDB.");
    }
  };

  const removeEvent = async (id: string): Promise<void> => {
    try {
      await deleteOrderEventApi(id);
      // MongoDB usa _id o id como string
      setEvents((prev) => prev.filter((s) => String(s.id || s._id) !== String(id)));
    } catch {
      setErrorMessage("No se pudo eliminar.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestión de Eventos (Mongo + PG)</Text>
      {!!errorMessage && <Text style={styles.error}>{errorMessage}</Text>}

      {/* Selector de Órdenes (Desde PostgreSQL) */}
      <Text style={styles.label}>Paciente / Orden (PostgreSQL)</Text>
      <View style={styles.pickerWrap}>
        <Picker
          selectedValue={selectedOrderId}
          onValueChange={(val) => setSelectedOrderId(val)}
          style={styles.picker}
          dropdownIconColor="#58a6ff"
        >
          {orders.map((o) => (
            <Picker.Item key={o.id} label={`${o.patient_name} (ID: ${o.id})`} value={o.id} />
          ))}
        </Picker>
      </View>

      {/* Selector de Eventos (Esquema MongoDB) */}
      <Text style={styles.label}>Estado de la Orden (Evento)</Text>
      <View style={styles.pickerWrap}>
        <Picker
          selectedValue={selectedEventType}
          onValueChange={(val) => setSelectedEventType(String(val))}
          style={styles.picker}
          dropdownIconColor="#58a6ff"
        >
          <Picker.Item label="Creado" value="CREATED" />
          <Picker.Item label="En Proceso" value="PROCESSING" />
          <Picker.Item label="Completado" value="COMPLETED" />
          <Picker.Item label="Cancelado" value="CANCELLED" />
          <Picker.Item label="Resultado Actualizado" value="RESULT_UPDATED" />
        </Picker>
      </View>

      <Text style={styles.label}>Notas adicionales</Text>
      <TextInput
        placeholder="Ej: Muestra recibida en recepción"
        placeholderTextColor="#8b949e"
        value={note}
        onChangeText={setNote}
        style={styles.input}
      />

      <Pressable onPress={createEvent} style={styles.btn}>
        <Text style={styles.btnText}>Guardar en MongoDB</Text>
      </Pressable>

      <Pressable onPress={loadAll} style={[styles.btn, styles.btnRefresh]}>
        <Text style={styles.btnText}>Refrescar Datos</Text>
      </Pressable>

      <FlatList
        data={events}
        keyExtractor={(item) => String(item.id || item._id)}
        renderItem={({ item }) => {
          // Buscamos el nombre del paciente en el mapa de Postgres usando lab_order_id de Mongo
          const orderData = orderById.get(item.lab_order_id);

          return (
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.rowText}>
                    {orderData ? `Paciente: ${orderData.patient_name}` : `Orden ID: ${item.lab_order_id}`}
                </Text>
                <Text style={[styles.rowSub, { color: item.event_type === 'CANCELLED' ? '#ff7b72' : '#58a6ff' }]}>
                    Evento: {item.event_type}
                </Text>
                <Text style={styles.rowSubSmall}>Origen: {item.source} | Fecha: {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Reciente'}</Text>
                {!!item.note && <Text style={styles.rowSubSmall}>Nota: {item.note}</Text>}
              </View>

              <Pressable onPress={() => removeEvent(String(item.id || item._id))}>
                <Text style={styles.del}>Eliminar</Text>
              </Pressable>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d1117", padding: 16 },
  title: { color: "#58a6ff", fontSize: 20, fontWeight: "800", marginBottom: 10 },
  error: { color: "#ff7b72", marginBottom: 10 },
  label: { color: "#8b949e", marginBottom: 6, marginTop: 6 },
  pickerWrap: { backgroundColor: "#161b22", borderRadius: 8, borderWidth: 1, borderColor: "#30363d", marginBottom: 10, overflow: "hidden" },
  picker: { color: "#c9d1d9" },
  input: { backgroundColor: "#161b22", color: "#c9d1d9", padding: 12, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: "#30363d" },
  btn: { backgroundColor: "#21262d", borderColor: "#58a6ff", borderWidth: 1, padding: 12, borderRadius: 8, marginBottom: 8 },
  btnRefresh: { borderColor: "#30363d", marginBottom: 12 },
  btnText: { color: "#58a6ff", textAlign: "center", fontWeight: "700" },
  row: { backgroundColor: "#161b22", padding: 12, borderRadius: 8, marginBottom: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderColor: "#30363d" },
  rowText: { color: "#c9d1d9", fontWeight: "800", fontSize: 15 },
  rowSub: { fontWeight: "600", marginTop: 2, fontSize: 13 },
  rowSubSmall: { color: "#8b949e", marginTop: 2, fontSize: 11 },
  del: { color: "#ff7b72", fontWeight: "800" },
});