import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx"
import Alumnos from "./pages/Alumnos.jsx"
import Administracion from "./pages/Administrador.jsx";
import Administrador from "./pages/Administrador.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/alumno" element={<Alumnos />} />
        <Route path="/administrador" element={<Administrador/>} />
      </Routes>
    </BrowserRouter>
  );
}

