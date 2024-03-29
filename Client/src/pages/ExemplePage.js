import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import Footer from "OurComponents/footer/Footer";
import UpperNavBar from "OurComponents/navBars/UpperNavBar";

export default function ExemplePage() {
  return (
    <DashboardLayout>
      <UpperNavBar />
      <h1>Eu sou um exemplo</h1>
      <p>texto</p>
      <Footer />
    </DashboardLayout>
  );
}