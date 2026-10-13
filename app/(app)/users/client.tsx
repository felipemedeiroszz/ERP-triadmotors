'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Shield, UserX, Key } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface UsersClientProps {
  initialProfiles: any[]
}

export function UsersClient({ initialProfiles }: UsersClientProps) {
  const supabase = createClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [resetDialog, setResetDialog] = useState<{ open: boolean; profile: any }>({ open: false, profile: null })
  const [deactivateDialog, setDeactivateDialog] = useState<{ open: boolean; profile: any }>({ open: false, profile: null })
  const [loading, setLoading] = useState(false)
  const [newPassword, setNewPassword] = useState('')

  const filteredProfiles = initialProfiles.filter((profile) =>
    profile.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (profile.email && profile.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getRoleBadge = (role: string) => {
    if (role === 'admin') {
      return <Badge className="bg-purple-600">Administrador</Badge>
    }
    return <Badge className="bg-blue-600">Funcionário</Badge>
  }

  const getActiveBadge = (active: boolean) => {
    if (active) {
      return <Badge className="bg-green-600">Ativo</Badge>
    }
    return <Badge className="bg-gray-600">Inativo</Badge>
  }

  const handleResetPassword = async () => {
    if (!resetDialog.profile || !newPassword) return

    setLoading(true)

    try {
      const { error } = await supabase.auth.admin.updateUserById(
        resetDialog.profile.id,
        { password: newPassword }
      )

      if (error) throw error

      toast.success('Senha alterada com sucesso!')
      setResetDialog({ open: false, profile: null })
      setNewPassword('')
    } catch (error: any) {
      toast.error('Erro ao alterar senha. Verifique se você tem permissão de admin.')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async () => {
    if (!deactivateDialog.profile) return

    setLoading(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ active: !deactivateDialog.profile.active })
        .eq('id', deactivateDialog.profile.id)

      if (error) throw error

      toast.success(`Usuário ${deactivateDialog.profile.active ? 'desativado' : 'ativado'} com sucesso!`)
      setDeactivateDialog({ open: false, profile: null })
      window.location.reload()
    } catch (error: any) {
      toast.error('Erro ao atualizar usuário')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar por nome ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
          />
        </div>

        <div className="rounded-md border border-gray-800">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-transparent">
                <TableHead className="text-gray-400">Nome</TableHead>
                <TableHead className="text-gray-400">E-mail</TableHead>
                <TableHead className="text-gray-400">Função</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Criado em</TableHead>
                <TableHead className="text-gray-400 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProfiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    Nenhum usuário encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredProfiles.map((profile) => (
                  <TableRow key={profile.id} className="border-gray-800 hover:bg-gray-800/50">
                    <TableCell className="text-white font-medium">{profile.full_name}</TableCell>
                    <TableCell className="text-gray-400">{profile.email || '-'}</TableCell>
                    <TableCell>{getRoleBadge(profile.role)}</TableCell>
                    <TableCell>{getActiveBadge(profile.active)}</TableCell>
                    <TableCell className="text-gray-400">
                      {new Date(profile.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:text-white hover:bg-gray-700"
                          onClick={() => setResetDialog({ open: true, profile })}
                          title="Resetar senha"
                        >
                          <Key className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`text-gray-400 hover:text-white hover:bg-gray-700 ${
                            !profile.active ? 'hover:text-red-400' : ''
                          }`}
                          onClick={() => setDeactivateDialog({ open: true, profile })}
                          title={profile.active ? 'Desativar' : 'Ativar'}
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Reset Password Dialog */}
      <Dialog open={resetDialog.open} onOpenChange={(open) => {
        setResetDialog({ open, profile: null })
        setNewPassword('')
      }}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
            <DialogDescription className="text-gray-400">
              Defina uma nova senha para o usuário "{resetDialog.profile?.full_name}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-gray-300">Nova Senha</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite a nova senha"
                className="bg-gray-800 border-gray-700 text-white"
                minLength={6}
              />
              <p className="text-xs text-gray-500">Mínimo de 6 caracteres</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setResetDialog({ open: false, profile: null })
                setNewPassword('')
              }}
              className="border-gray-700 text-white hover:bg-gray-800"
            >
              Cancelar
            </Button>
            <Button onClick={handleResetPassword} className="bg-red-600 hover:bg-red-700 text-white" disabled={loading || !newPassword}>
              {loading ? 'Processando...' : 'Alterar Senha'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate Dialog */}
      <Dialog open={deactivateDialog.open} onOpenChange={(open) => setDeactivateDialog({ open, profile: null })}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>
              {deactivateDialog.profile?.active ? 'Desativar Usuário' : 'Ativar Usuário'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {deactivateDialog.profile?.active
                ? `Tem certeza que deseja desativar o usuário "${deactivateDialog.profile?.full_name}"? Ele não poderá mais acessar o sistema.`
                : `Tem certeza que deseja ativar o usuário "${deactivateDialog.profile?.full_name}"?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeactivateDialog({ open: false, profile: null })}
              className="border-gray-700 text-white hover:bg-gray-800"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleToggleActive}
              className={deactivateDialog.profile?.active ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
              disabled={loading}
            >
              {loading ? 'Processando...' : deactivateDialog.profile?.active ? 'Desativar' : 'Ativar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
