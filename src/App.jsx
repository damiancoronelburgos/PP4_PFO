import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Alumnos from "./pages/Alumnos.jsx";
import Preceptor from "./pages/Preceptor.jsx";
import Administrador from "./pages/Administrador.jsx";
import Docente from "./pages/Docente.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx"; // wrapper de auth

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Público */}
        <Route path="/" element={<Login />} />

        {/* Privados por rol */}
        <Route
          path="/alumno"
          element={
            <ProtectedRoute allow={["alumno"]}>
              <Alumnos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/preceptor"
          element={
            <ProtectedRoute allow={["preceptor"]}>
              <Preceptor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/administrador"
          element={
            <ProtectedRoute allow={["administrador"]}>
              <Administrador />
            </ProtectedRoute>
          }
        />
        <Route
          path="/docente"
          element={
            <ProtectedRoute allow={["docente"]}>
              <Docente />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}