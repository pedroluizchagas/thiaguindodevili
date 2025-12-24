"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { COOLER_STATUS_CONFIG } from "@/lib/constants/admin"
import type { Cooler, CoolerStatus } from "@/lib/types/admin"
import { MoreHorizontal, QrCode, Edit, Trash2, Wrench, AlertTriangle, CheckCircle, Search } from "lucide-react"

interface CoolersTableProps {
  coolers: Cooler[]
}

export function CoolersTable({ coolers: initialCoolers }: CoolersTableProps) {
  const [coolers, setCoolers] = useState(initialCoolers)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<CoolerStatus | "all">("all")
  const [editingCooler, setEditingCooler] = useState<Cooler | null>(null)
  const [deletingCooler, setDeletingCooler] = useState<Cooler | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const filteredCoolers = coolers.filter((cooler) => {
    const matchesSearch = cooler.qr_code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || cooler.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const updateCoolerStatus = async (cooler: Cooler, newStatus: CoolerStatus) => {
    const supabase = createClient()
    setIsLoading(true)

    const { error } = await supabase.from("coolers").update({ status: newStatus }).eq("id", cooler.id)

    if (!error) {
      setCoolers((prev) => prev.map((c) => (c.id === cooler.id ? { ...c, status: newStatus } : c)))
    }
    setIsLoading(false)
  }

  const handleEditSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingCooler) return

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()
    setIsLoading(true)

    const updates = {
      qr_code: formData.get("qr_code") as string,
      capacity: formData.get("capacity") as string,
      status: formData.get("status") as CoolerStatus,
      notes: formData.get("notes") as string,
    }

    const { error } = await supabase.from("coolers").update(updates).eq("id", editingCooler.id)

    if (!error) {
      setCoolers((prev) => prev.map((c) => (c.id === editingCooler.id ? { ...c, ...updates } : c)))
      setEditingCooler(null)
    }
    setIsLoading(false)
  }

  const handleDelete = async () => {
    if (!deletingCooler) return

    const supabase = createClient()
    setIsLoading(true)

    const { error } = await supabase.from("coolers").delete().eq("id", deletingCooler.id)

    if (!error) {
      setCoolers((prev) => prev.filter((c) => c.id !== deletingCooler.id))
      setDeletingCooler(null)
      router.refresh()
    }
    setIsLoading(false)
  }

  return (
    <>
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg">Lista de Coolers</CardTitle>
            <div className="flex gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar QR Code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-background/50"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as CoolerStatus | "all")}>
                <SelectTrigger className="w-40 bg-background/50">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="available">Disponível</SelectItem>
                  <SelectItem value="in_use">Em Uso</SelectItem>
                  <SelectItem value="maintenance">Manutenção</SelectItem>
                  <SelectItem value="lost">Perdido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">QR Code</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Capacidade</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Última Manutenção</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Observações</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoolers.map((cooler) => {
                  const statusConfig = COOLER_STATUS_CONFIG[cooler.status]
                  return (
                    <tr key={cooler.id} className="border-b border-border/30 hover:bg-muted/20">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <QrCode className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono font-medium text-foreground">{cooler.qr_code}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground capitalize">{cooler.capacity}</td>
                      <td className="py-3 px-4">
                        <Badge className={`${statusConfig.bgColor} ${statusConfig.color} border-0`}>
                          {statusConfig.label}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {cooler.last_maintenance
                          ? new Date(cooler.last_maintenance).toLocaleDateString("pt-BR")
                          : "Nunca"}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground max-w-xs truncate">
                        {cooler.notes || "-"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={isLoading}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingCooler(cooler)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {cooler.status !== "available" && (
                              <DropdownMenuItem onClick={() => updateCoolerStatus(cooler, "available")}>
                                <CheckCircle className="mr-2 h-4 w-4 text-green-400" />
                                Marcar Disponível
                              </DropdownMenuItem>
                            )}
                            {cooler.status !== "maintenance" && (
                              <DropdownMenuItem onClick={() => updateCoolerStatus(cooler, "maintenance")}>
                                <Wrench className="mr-2 h-4 w-4 text-yellow-400" />
                                Enviar p/ Manutenção
                              </DropdownMenuItem>
                            )}
                            {cooler.status !== "lost" && (
                              <DropdownMenuItem onClick={() => updateCoolerStatus(cooler, "lost")}>
                                <AlertTriangle className="mr-2 h-4 w-4 text-red-400" />
                                Marcar como Perdido
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => setDeletingCooler(cooler)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {filteredCoolers.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">Nenhum cooler encontrado</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingCooler} onOpenChange={() => setEditingCooler(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cooler</DialogTitle>
            <DialogDescription>Atualize as informações do cooler</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="qr_code">QR Code</Label>
              <Input
                id="qr_code"
                name="qr_code"
                defaultValue={editingCooler?.qr_code}
                className="bg-background/50 font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacidade</Label>
              <Select name="capacity" defaultValue={editingCooler?.capacity}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard (45L)</SelectItem>
                  <SelectItem value="large">Grande (65L)</SelectItem>
                  <SelectItem value="extra-large">Extra Grande (85L)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={editingCooler?.status}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Disponível</SelectItem>
                  <SelectItem value="in_use">Em Uso</SelectItem>
                  <SelectItem value="maintenance">Manutenção</SelectItem>
                  <SelectItem value="lost">Perdido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                name="notes"
                defaultValue={editingCooler?.notes || ""}
                className="bg-background/50"
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingCooler(null)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingCooler} onOpenChange={() => setDeletingCooler(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o cooler{" "}
              <span className="font-mono font-semibold">{deletingCooler?.qr_code}</span>? Esta ação não pode ser
              desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingCooler(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {isLoading ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
