import Header from "./Header";
import Footer from "./Footer";
import { CustomCursor } from "./CustomCursor";

const Layout = ({ children }: { children: React.ReactNode }) => (
  <>
    <CustomCursor />
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  </>
);

export default Layout;
