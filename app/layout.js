import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "StarSocial",
  description: "Rate the world. ★",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <div className="h-[100dvh] flex flex-col">
            <Navbar />
            <main className="flex-1 min-h-0">{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
