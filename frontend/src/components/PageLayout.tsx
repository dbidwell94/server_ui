import Navbar from "./Navbar";
import Footer from "./Footer";

interface PageLayoutProps {
  children: React.ReactNode;
  showNavbar?: boolean;
  showFooter?: boolean;
}

export default function PageLayout({ children, showNavbar = true, showFooter = false }: PageLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      {showNavbar && <Navbar />}
      <div className="flex-1 flex flex-col">
        {children}
      </div>
      {showFooter && <Footer />}
    </div>
  );
}
