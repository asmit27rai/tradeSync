"use client";
import LandingPage from "@/components/LandingPage";
import { BrowserRouter as Router } from "react-router-dom";

export default function Home() {
  return (
    <Router>
      <LandingPage />
    </Router>
  );
}
