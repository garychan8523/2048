import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Layout from "./components/Layout";
import "./App.css";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<Layout />}>
                    <Route path="/" element={<Home />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;