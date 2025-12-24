import { createClient } from "@/lib/supabase/server"
import { CustomersTable } from "@/components/admin/customers-table"

export default async function CustomersPage() {
  const supabase = await createClient()

  const { data: customers } = await supabase.from("customers").select("*").order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Clientes</h2>
        <p className="text-muted-foreground">Gerenciamento de clientes cadastrados</p>
      </div>

      <CustomersTable customers={customers || []} />
    </div>
  )
}
