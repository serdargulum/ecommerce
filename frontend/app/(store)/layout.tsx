import { CartProvider } from "@/components/CartProvider";
import StoreFooter from "@/components/StoreFooter";
import StoreNavbar from "@/components/StoreNavbar";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <StoreNavbar />
      <main>{children}</main>
      <StoreFooter />
    </CartProvider>
  );
}
