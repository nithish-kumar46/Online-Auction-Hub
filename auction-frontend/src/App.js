import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateItem from "./pages/CreateItem";
import Bid from "./pages/Bid";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/create" element={<CreateItem />} />
        <Route path="/bid/:id" element={<Bid />} />
      </Routes>
    </Router>
  );
}

export default App;