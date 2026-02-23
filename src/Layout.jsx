import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <div style={{ paddingTop: "72px" }}>{children}</div>
      <Footer />
    </>
  );
}