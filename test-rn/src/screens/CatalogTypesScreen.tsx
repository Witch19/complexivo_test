import { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, FlatList, StyleSheet } from "react-native";
import { listCatalogTypesApi, createCatalogTypeApi, deleteCatalogTypeApi } from "../api/CatalogTypes.api";  
import type { CatalogType } from "../types/CatalogType";
import { toArray } from "../types/drf";

function normalizeText(input: string): string {
  return input.trim();
}

export default function TestTypesScreen() {
  const [items, setItems] = useState<CatalogType[]>([]);
  const [testName, setTestName] = useState(""); // Cambiado de 'name' a 'testName'
  const [category, setCategory] = useState(""); // Cambiado a CamelCase por convención
  const [errorMessage, setErrorMessage] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const load = async (): Promise<void> => {
    try {
      setErrorMessage("");
      const data = await listCatalogTypesApi();
      setItems(toArray(data));
    } catch {
      setErrorMessage("No se pudo cargar los tipos de Catálogo.");
    }
  };

  useEffect(() => { load(); }, []);

  const createItem = async (): Promise<void> => {
    if (isCreating) return;
    try {
      setErrorMessage("");
      const cleanName = normalizeText(testName);
      if (!cleanName) return setErrorMessage("El nombre es requerido");

      setIsCreating(true);
      const created = await createCatalogTypeApi({
        test_name: cleanName, // Usamos la propiedad correcta de tu interfaz
        category: normalizeText(category) || undefined,
      } as any);

      setItems((prev) => [created, ...prev]);
      setTestName("");
      setCategory("");
    } catch {
      setErrorMessage("No se pudo crear el tipo de examen.");
    } finally {
      setIsCreating(false);
    }
  };

  const removeItem = async (id: string | number): Promise<void> => {
    try {
      setErrorMessage("");
      await deleteCatalogTypeApi(String(id));
      setItems((prev) => prev.filter((it) => String(it.id) !== String(id)));
    } catch {
      setErrorMessage("No se pudo eliminar el registro.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tipos de Catálogo</Text>
      
      {!!errorMessage && <Text style={styles.error}>{errorMessage}</Text>}

      <Text style={styles.label}>Nombre del Examen</Text>
      <TextInput
        value={testName}
        onChangeText={setTestName}
        placeholder="Ej: Hemoglobina"
        placeholderTextColor="#8b949e"
        style={styles.input}
      />

      <Text style={styles.label}>Categoría (opcional)</Text>
      <TextInput
        value={category}
        onChangeText={setCategory}
        placeholder="Ej: Endocrinología"
        placeholderTextColor="#8b949e"
        style={styles.input}
      />

      <Pressable 
        onPress={createItem} 
        style={[styles.btn, isCreating && { opacity: 0.6 }]}
        disabled={isCreating}
      >
        <Text style={styles.btnText}>{isCreating ? "Guardando..." : "Crear"}</Text>
      </Pressable>

      <Pressable onPress={load} style={[styles.btn, styles.btnSecondary]}>
        <Text style={styles.btnText}>Refrescar</Text>
      </Pressable>

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              {/* CORRECCIÓN: Usamos item.test_name en lugar de item.name */}
              <Text style={styles.rowText} numberOfLines={1}>{item.test_name}</Text>
              {!!item.category && (
                <Text style={styles.rowSub} numberOfLines={1}>
                  {String(item.category)}
                </Text>
              )}
            </View>

            <Pressable onPress={() => removeItem(item.id)}>
              <Text style={styles.del}>Eliminar</Text>
            </Pressable>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d1117", padding: 16 },
  title: { color: "#58a6ff", fontSize: 22, fontWeight: "800", marginBottom: 10 },
  error: { color: "#ff7b72", marginBottom: 10, textAlign: 'center' },
  label: { color: "#8b949e", marginBottom: 6, marginTop: 6 },
  input: {
    backgroundColor: "#161b22",
    color: "#c9d1d9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#30363d",
  },
  btn: { 
    backgroundColor: "#21262d", 
    borderColor: "#58a6ff", 
    borderWidth: 1, 
    padding: 12, 
    borderRadius: 8,
    marginBottom: 8 
  },
  btnSecondary: { marginBottom: 12, borderColor: "#30363d" },
  btnText: { color: "#58a6ff", textAlign: "center", fontWeight: "700" },
  row: {
    backgroundColor: "#161b22",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#30363d",
  },
  rowText: { color: "#c9d1d9", fontWeight: "800", fontSize: 16 },
  rowSub: { color: "#8b949e", marginTop: 2, fontSize: 13 },
  del: { color: "#ff7b72", fontWeight: "700", padding: 4 },
});