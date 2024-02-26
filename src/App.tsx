import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ContactPage from "./pages/ContactPage";
import NoPage from "./pages/404Page";
import EventsPage from "./pages/EventsPage";
import NavigationBar from "./Components/NavigationBar";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUp";

export default function App() {
  return (
    <BrowserRouter>
      <NavigationBar />
      <Routes>
        <Route index element={<HomePage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signUp" element={<SignUpPage />} />
        <Route path="*" element={<NoPage />} />
      </Routes>
    </BrowserRouter>
  );
}
