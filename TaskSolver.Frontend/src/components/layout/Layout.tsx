// /src/components/layout/Layout.tsx
import { Header } from "./Header";

export const Layout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  );
};
