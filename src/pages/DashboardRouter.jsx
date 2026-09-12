import { useAuth } from "@/lib/AuthContext";
import CompanyDashboard from "@/pages/company/Dashboard";
import CreatorDashboard from "@/pages/creator/CreatorDashboard";

export default function DashboardRouter() {
  const { user } = useAuth();
  if (user?.user_type === "creator") return <CreatorDashboard />;
  return <CompanyDashboard />;
}