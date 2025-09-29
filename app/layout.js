import { Inter } from "next/font/google";
// import { ClerkProvider } from "@clerk/nextjs"; // Temporarily disabled
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Personal Finance Dashboard",
  description: "Track your income, expenses, and manage your finances",
};

export default function RootLayout({ children }) {
  return (
    // <ClerkProvider> // Temporarily disabled
      <html lang="en">
        <body className={inter.className}>
          {children}
          <Toaster position="top-right" />
        </body>
      </html>
    // </ClerkProvider> // Temporarily disabled
  );
}