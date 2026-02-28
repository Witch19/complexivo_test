import { useEffect, useState } from "react";
import {
  Container, Paper, Typography, TextField, Button, Stack,
  Table, TableHead, TableRow, TableCell, TableBody, IconButton, Alert,
  FormControl, InputLabel, Select, MenuItem
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { type Tests, listTestsApi } from "../api/Tests.api";
import { type Order, listOrdersAdminApi, createOrderApi, updateOrderApi, deleteOrderApi } from "../api/Orders.api";

export default function AdminReservationsPage() {
  const [items, setItems] = useState<Order[]>([]);
  const [testsList, setTestsList] = useState<Tests[]>([]);
  
  const [error, setError] = useState("");
  const [editId, setEditId] = useState<number | null>(null);

  const [testId, setTestId] = useState<number | "">(""); 
  const [patientName, setPatientName] = useState("");
  const [status, setStatus] = useState<"CREATED" | "PROCESSING" | "COMPLETED" | "CANCELLED">("CREATED");
  const [resultSummary, setResultSummary] = useState("");

  const loadOrders = async () => {
    try {
      setError("");
      const data = await listOrdersAdminApi();
      setItems(data.results || data); 
    } catch (err) {
      setError("No se pudo cargar las órdenes. Verifique su sesión.");
    }
  };

  const loadTests = async () => {
    try {
      const data = await listTestsApi();
      const results = data.results || data;
      setTestsList(results);
      if (results.length > 0 && testId === "") {
        setTestId(results[0].id);
      }
    } catch (err) {
      console.error("Error al cargar tests", err);
    }
  };

  useEffect(() => { 
    loadOrders(); 
    loadTests(); 
  }, []);

  const save = async () => {
    try {
      setError("");
      
      if (!testId) return setError("Debe seleccionar un examen médico.");
      if (!patientName.trim()) return setError("El nombre del paciente es obligatorio.");

      const payload = {
        test_id: Number(testId), // Usando test_id como en tu prueba exitosa de Postman
        patient_name: patientName.trim(),
        status: status,
        result_summary: resultSummary
      };

      if (editId) {
        await updateOrderApi(editId, payload);
      } else {
        await createOrderApi(payload as any);
      }

      resetForm();
      await loadOrders();
    } catch (err: any) {
      const backendError = err.response?.data 
        ? JSON.stringify(err.response.data) 
        : "Error de conexión con el servidor.";
      setError("No se pudo guardar: " + backendError);
    }
  };

  const resetForm = () => {
    setEditId(null);
    setPatientName("");
    setResultSummary("");
    setStatus("CREATED");
    if (testsList.length > 0) setTestId(testsList[0].id);
  };

  const startEdit = (v: Order) => {
    setEditId(v.id);
    setTestId(v.test_id || v.test); 
    setPatientName(v.patient_name);
    setResultSummary(v.result_summary || "");
    setStatus(v.status);
  };

  const remove = async (id: number) => {
    if (!window.confirm("¿Está seguro de eliminar esta orden?")) return;
    try {
      setError("");
      await deleteOrderApi(id);
      await loadOrders();
    } catch (err) {
      setError("No se pudo eliminar la orden.");
    }
  };

  return (
    <Container sx={{ mt: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Gestión de Órdenes de Laboratorio</Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Stack spacing={2} sx={{ mb: 3 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <FormControl sx={{ minWidth: 260 }}>
              <InputLabel id="test-label">Examen Médico</InputLabel>
              <Select
                labelId="test-label"
                label="Examen Médico"
                value={testId}
                onChange={(e) => setTestId(Number(e.target.value))}
              >
                {testsList.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.test_name} (#{t.id})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField 
              label="Nombre del Paciente" 
              value={patientName} 
              onChange={(e) => setPatientName(e.target.value)} 
              fullWidth 
            />
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <FormControl sx={{ minWidth: 220 }}>
              <InputLabel id="status-label">Estado</InputLabel>
              <Select
                labelId="status-label"
                label="Estado"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <MenuItem value="CREATED">CREADO</MenuItem>
                <MenuItem value="PROCESSING">EN PROCESO</MenuItem>
                <MenuItem value="COMPLETED">COMPLETADO</MenuItem>
                <MenuItem value="CANCELLED">CANCELADO</MenuItem>
              </Select>
            </FormControl>

            <TextField 
              label="Resumen de Resultados" 
              value={resultSummary} 
              onChange={(e) => setResultSummary(e.target.value)} 
              fullWidth 
            />
          </Stack>

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="contained" onClick={save}>
              {editId ? "Actualizar" : "Crear"}
            </Button>
            <Button variant="outlined" onClick={resetForm}>Limpiar</Button>
          </Stack>
        </Stack>

        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "#f5f5f5" }}>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Paciente</strong></TableCell>
              <TableCell><strong>Resultados</strong></TableCell>
              <TableCell><strong>Estado</strong></TableCell>
              <TableCell align="right"><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((v) => (
              <TableRow key={v.id} hover>
                <TableCell>{v.id}</TableCell>
                <TableCell>{v.patient_name}</TableCell>
                <TableCell>{v.result_summary || "Sin resultados"}</TableCell>
                <TableCell>{v.status}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => startEdit(v)}><EditIcon /></IconButton>
                  <IconButton onClick={() => remove(v.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}