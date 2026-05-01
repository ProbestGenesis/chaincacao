import { RoleGuard } from "@/components/layout/role-guard"
import { TransformerDashboard } from "@/components/dashboards/transformer-dashboard"

export default function TransformerPage() {
  return (
    <RoleGuard allowedRoles={["Transformer"]}>
      <TransformerDashboard />
    </RoleGuard>
  )
}
