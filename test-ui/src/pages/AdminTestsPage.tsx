import { useEffect, useState } from "react";
import {
  Container, Paper, Typography, TextField, Button, Stack,
  Table, TableHead, TableRow, TableCell, TableBody, IconButton, Alert
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { type Tests, listTestsApi, createTestApi, updateTestApi, deleteTestApi } from "../api/Tests.api";

export default function AdminTestsPage() {
  const [items, setItems] = useState<Tests[]>([]);
  const [testName, setTestName] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setError("");
      const data = await listTestsApi();
      setItems(data.results); // DRF paginado
    } catch (error) {
      setError("No se pudo cargar Tests. ¿Login? ¿Token admin?");
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      setError("");
      if (!testName.trim()) return setError("test_name requerido");

      if (editId) await updateTestApi(editId, testName.trim());
      else await createTestApi(testName.trim());

      setTestName("");
      setEditId(null);
      await load();
    } catch (error) {
      setError("No se pudo guardar test. ¿Token admin?");
    }
  };

  const startEdit = (m: Tests) => {
    setEditId(m.id);
    setTestName(m.test_name);
  };

  const remove = async (id: number) => {
    try {
      setError("");
      await deleteTestApi(id);
      await load();
    } catch (error) {
      setError("No se pudo eliminar test. ¿Pedidos asociados? ¿Token admin?");
    }
  };

  return (
    <Container sx={{ mt: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Admin Tests (Privado)</Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
          <TextField label="test name" value={testName} onChange={(e) => setTestName(e.target.value)} fullWidth />
          <Button variant="contained" onClick={save}>{editId ? "Actualizar" : "Crear"}</Button>
          <Button variant="outlined" onClick={() => { setTestName(""); setEditId(null); }}>Limpiar</Button>
          <Button variant="outlined" onClick={load}>Refrescar</Button>
        </Stack>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>test name</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((m) => (
              <TableRow key={m.id}>
                <TableCell>{m.id}</TableCell>
                <TableCell>{m.test_name}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => startEdit(m)}><EditIcon /></IconButton>
                  <IconButton onClick={() => remove(m.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}