import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx"
import Alumnos from "./pages/Alumnos.jsx"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/alumno" element={<Alumnos />} />
      </Routes>
    </BrowserRouter>
  );
}

