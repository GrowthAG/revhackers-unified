import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AdminPageLayout from "@/components/layout/AdminPageLayout";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, CheckCircle, XCircle, Shield, ShieldAlert, User, Users, Mail, Send, Plus, Trash2, Edit2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface UserProfile {
    id: string;
    email: string;
    username: string;
    full_name: string;
    role: "super_admin" | "admin" | "user";
    status: "active" | "pending" | "inactive";
    avatar_url: string;
    created_at: string;
}

interface Invitation {
    id: string;
    email: string;
    role: string;
    status: string;
    created_at: string;
}

const AdminUsers = () => {
    const { user: currentUser, userRole } = useAuth();
    const { toast } = useToast();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [updating, setUpdating] = useState<string | null>(null);
    const [inviting, setInviting] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteData, setInviteData] = useState({ email: "", role: "user" });

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editData, setEditData] = useState<UserProfile | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        await Promise.all([fetchUsers(), fetchInvitations()]);
        setLoading(false);
    };

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setUsers(data as any || []);
        } catch (error: any) {
            console.error("Error fetching users:", error);
        }
    };

    const fetchInvitations = async () => {
        try {
            const { data, error } = await supabase
                .from("invitations")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setInvitations(data || []);
        } catch (error: any) {
            console.error("Error fetching invitations:", error);
        }
    };

    const handleInvite = async () => {
        if (!inviteData.email) return;
        setInviting(true);
        try {
            const { data: functionData, error: functionError } = await supabase.functions.invoke('invite-member', {
                body: {
                    email: inviteData.email,
                    role: inviteData.role,
                    redirectTo: `${window.location.origin}/reset-password`
                }
            });

            if (functionError) throw new Error(functionError.message || "Erro ao disparar e-mail de convite");

            const { error: dbError } = await supabase
                .from("invitations")
                .insert([{
                    email: inviteData.email,
                    role: inviteData.role,
                    invited_by: currentUser?.id,
                    status: 'pending'
                }]);

            toast({
                title: "Convite Enviado!",
                description: `O e-mail de acesso foi enviado para ${inviteData.email}.`
            });

            setIsInviteModalOpen(false);
            setInviteData({ email: "", role: "user" });
            fetchInvitations();
        } catch (error: any) {
            toast({
                title: "Erro ao convidar",
                description: error.message || "Ocorreu um erro inesperado.",
                variant: "destructive",
            });
        } finally {
            setInviting(false);
        }
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        const targetUser = users.find(u => u.id === userId);
        if (!targetUser) return;

        const roleLevels = { super_admin: 3, admin: 2, user: 1 };
        const myLevel = roleLevels[userRole as keyof typeof roleLevels] || 0;
        const targetLevel = roleLevels[targetUser.role as keyof typeof roleLevels] || 0;

        if (myLevel <= targetLevel && currentUser?.id !== userId) {
            toast({
                title: "Acesso Negado",
                description: "Você não tem permissão para alterar o cargo deste nível.",
                variant: "destructive"
            });
            return;
        }

        setUpdating(userId);
        try {
            const { error } = await supabase
                .from("profiles")
                .update({ role: newRole })
                .eq("id", userId);

            if (error) throw error;

            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as any } : u));
            toast({ title: "Role atualizada com sucesso!" });
        } catch (error: any) {
            toast({
                title: "Erro ao atualizar",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setUpdating(null);
        }
    };

    const handleDeleteUser = async (user: UserProfile) => {
        const roleLevels = { super_admin: 3, admin: 2, user: 1 };
        const myLevel = roleLevels[userRole as keyof typeof roleLevels] || 0;
        const targetLevel = roleLevels[user.role as keyof typeof roleLevels] || 0;

        if (myLevel <= targetLevel || currentUser?.id === user.id) {
            toast({
                title: "Ações Restritas",
                description: "Você não pode excluir um usuário de mesmo nível ou superior.",
                variant: "destructive"
            });
            return;
        }

        if (!confirm(`TEM CERTEZA QUE DESEJA EXCLUIR ${user.email.toUpperCase()}?`)) return;

        setUpdating(user.id);
        try {
            const { data, error } = await supabase.functions.invoke('delete-user', {
                body: { userId: user.id }
            });

            if (error) throw error;

            setUsers(users.filter(u => u.id !== user.id));
            toast({ title: "Usuário excluído com sucesso." });
        } catch (error: any) {
            toast({
                title: "Erro ao excluir",
                description: error.message || "Não foi possível remover o usuário.",
                variant: "destructive",
            });
        } finally {
            setUpdating(null);
        }
    };

    const handleStatusChange = async (userId: string, newStatus: string) => {
        setUpdating(userId);
        try {
            const { error } = await supabase
                .from("profiles")
                .update({ status: newStatus })
                .eq("id", userId);

            if (error) throw error;

            setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus as any } : u));
            toast({ title: "Status atualizado com sucesso!" });
        } catch (error: any) {
            toast({
                title: "Erro ao atualizar",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setUpdating(null);
        }
    };

    const handleEditClick = (user: UserProfile) => {
        setEditData(user);
        setIsEditModalOpen(true);
    };

    const handleRunUpdateUser = async () => {
        if (!editData) return;
        setUpdating(editData.id);

        try {
            const { error } = await supabase
                .from("profiles")
                .update({
                    full_name: editData.full_name,
                    role: editData.role,
                    status: editData.status
                })
                .eq("id", editData.id);

            if (error) throw error;

            setUsers(users.map(u => u.id === editData.id ? editData : u));
            toast({ title: "Usuário atualizado com sucesso!" });
            setIsEditModalOpen(false);
        } catch (error: any) {
            toast({
                title: "Erro ao atualizar",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setUpdating(null);
        }
    };

    const filteredUsers = users.filter(user =>
        (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || "") ||
        (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || "")
    );

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "active": return <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">ATIVO</span>;
            case "inactive": return <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">INATIVO</span>;
            default: return <span className="text-[9px] font-black uppercase tracking-widest text-red-500">PENDENTE</span>;
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
        );
    }

    return (
        <PageLayout>
            <AdminPageLayout
                title="Gestão de Usuários"
                description="Gerencie permissões e acessos ao sistema."
                backTo="/admin"
                backLabel="Voltar ao Hub"
                actions={
                    <Button onClick={() => setIsInviteModalOpen(true)} className="bg-black text-white hover:bg-zinc-800 rounded-none h-10 px-4 text-xs font-bold uppercase tracking-widest">
                        <Plus className="mr-2 h-4 w-4" /> Convidar Membro
                    </Button>
                }
            >
                <div className="space-y-8">
                    {/* Search bar */}
                    <div className="max-w-xl">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                            <Input
                                placeholder="Buscar por nome ou e-mail..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 h-11 border-zinc-200 rounded-none focus-visible:ring-0 focus-visible:border-black text-sm"
                            />
                        </div>
                    </div>

                    <Tabs defaultValue="active" className="w-full">
                        <TabsList className="bg-transparent border-b border-zinc-200 h-auto p-0 gap-8 mb-8 rounded-none w-full justify-start">
                            <TabsTrigger value="active" className="px-1 py-4 data-[state=active]:bg-transparent data-[state=active]:text-black data-[state=active]:border-b-2 data-[state=active]:border-black text-zinc-400 hover:text-black rounded-none uppercase tracking-widest font-black text-[10px] transition-all">
                                MEMBROS ATIVOS ({users.length})
                            </TabsTrigger>
                            <TabsTrigger value="pending" className="px-1 py-4 data-[state=active]:bg-transparent data-[state=active]:text-black data-[state=active]:border-b-2 data-[state=active]:border-black text-zinc-400 hover:text-black rounded-none uppercase tracking-widest font-black text-[10px] transition-all">
                                CONVITES PENDENTES ({invitations.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="active">
                            <div className="bg-white border border-zinc-200 rounded-none overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-zinc-50/50 hover:bg-zinc-50/50 transition-none">
                                            <TableHead className="text-black font-bold uppercase tracking-widest text-[9px] py-4 pl-6">Usuário</TableHead>
                                            <TableHead className="text-black font-bold uppercase tracking-widest text-[9px] py-4">Nível</TableHead>
                                            <TableHead className="text-black font-bold uppercase tracking-widest text-[9px] py-4">Status</TableHead>
                                            <TableHead className="text-black font-bold uppercase tracking-widest text-[9px] py-4 text-right pr-6">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredUsers.map((user) => (
                                            <TableRow key={user.id} className="hover:bg-zinc-50/50 transition-all border-zinc-100">
                                                <TableCell className="py-4 pl-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-zinc-100 flex items-center justify-center overflow-hidden border border-zinc-200">
                                                            {user.avatar_url ? (
                                                                <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <User className="h-4 w-4 text-zinc-400" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-black text-[13px] uppercase tracking-tight">{user.full_name || "Membro"}</div>
                                                            <div className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <Select
                                                        defaultValue={user.role || 'user'}
                                                        onValueChange={(val) => handleRoleChange(user.id, val)}
                                                        disabled={updating === user.id}
                                                    >
                                                        <SelectTrigger className="w-[140px] h-8 border-zinc-200 rounded-none text-[10px] font-bold uppercase tracking-widest text-black shadow-none bg-white">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-none border-black">
                                                            <SelectItem value="user" className="uppercase text-[9px] tracking-widest">COLABORADOR</SelectItem>
                                                            <SelectItem value="admin" className="uppercase text-[9px] tracking-widest">ADMIN</SelectItem>
                                                            <SelectItem value="super_admin" className="uppercase text-[9px] tracking-widest">SUPER ADMIN</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell className="py-4 whitespace-nowrap">
                                                    {getStatusBadge(user.status || 'pending')}
                                                </TableCell>
                                                <TableCell className="text-right pr-6 py-4">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleEditClick(user)}
                                                            className="h-8 w-8 text-zinc-400 hover:text-black hover:bg-zinc-50 rounded-none transition-all"
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDeleteUser(user)}
                                                            className="h-8 w-8 text-zinc-400 hover:text-red-500 hover:bg-zinc-50 rounded-none transition-all"
                                                            disabled={updating === user.id}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </TabsContent>

                        <TabsContent value="pending">
                            <div className="bg-white border border-zinc-200 rounded-none overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-zinc-50/50 hover:bg-zinc-50/50 transition-none">
                                            <TableHead className="text-black font-bold uppercase tracking-widest text-[9px] py-4 pl-6">E-mail</TableHead>
                                            <TableHead className="text-black font-bold uppercase tracking-widest text-[9px] py-4">Nível Pretendido</TableHead>
                                            <TableHead className="text-black font-bold uppercase tracking-widest text-[9px] py-4 text-right pr-6">Data</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {invitations.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={3} className="h-32 text-center text-zinc-400 text-xs uppercase tracking-widest font-medium">Nenhum convite pendente.</TableCell>
                                            </TableRow>
                                        ) : invitations.map((invite) => (
                                            <TableRow key={invite.id} className="hover:bg-zinc-50/50 transition-all border-zinc-100">
                                                <TableCell className="py-4 pl-6 font-bold text-black border-zinc-100 uppercase tracking-widest text-[11px]">{invite.email}</TableCell>
                                                <TableCell className="py-4">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 bg-zinc-100 px-2 py-1">{invite.role}</span>
                                                </TableCell>
                                                <TableCell className="text-right pr-6 py-4 text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                                                    {new Date(invite.created_at).toLocaleDateString('pt-BR')}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Modals */}
                <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
                    <DialogContent className="max-w-md bg-white border border-black p-8 rounded-none shadow-none">
                        <DialogHeader className="mb-6">
                            <DialogTitle className="text-xl font-black uppercase tracking-widest">Novo Convite</DialogTitle>
                            <DialogDescription className="text-xs text-zinc-400 uppercase tracking-widest mt-1">Conceda acesso a um novo orquestrador.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">E-mail Corporativo</Label>
                                <Input
                                    value={inviteData.email}
                                    onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                                    className="h-10 border-zinc-200 rounded-none focus-visible:ring-0 focus-visible:border-black uppercase text-xs tracking-widest"
                                    placeholder="NOME@EMPRESA.COM"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Nível de Acesso</Label>
                                <Select
                                    value={inviteData.role}
                                    onValueChange={(val) => setInviteData({ ...inviteData, role: val })}
                                >
                                    <SelectTrigger className="h-10 border-zinc-200 rounded-none text-xs uppercase tracking-widest font-black">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-none border-black">
                                        <SelectItem value="user" className="uppercase text-[10px] tracking-widest">COLABORADOR</SelectItem>
                                        <SelectItem value="admin" className="uppercase text-[10px] tracking-widest">ADMIN</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter className="mt-8">
                            <Button onClick={handleInvite} disabled={inviting} className="w-full h-11 bg-black text-white hover:bg-zinc-800 rounded-none font-black uppercase tracking-widest">
                                {inviting ? "Enviando..." : "Enviar Convite"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogContent className="max-w-md bg-white border border-black p-8 rounded-none shadow-none">
                        <DialogHeader className="mb-6">
                            <DialogTitle className="text-xl font-black uppercase tracking-widest">Editar Usuário</DialogTitle>
                        </DialogHeader>
                        {editData && (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Nome Completo</Label>
                                    <Input
                                        value={editData.full_name || ''}
                                        onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                                        className="h-10 border-zinc-200 rounded-none focus-visible:ring-0 focus-visible:border-black uppercase text-xs tracking-widest font-bold"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Cargo</Label>
                                        <Select
                                            value={editData.role}
                                            onValueChange={(val: any) => setEditData({ ...editData, role: val })}
                                        >
                                            <SelectTrigger className="h-10 border-zinc-200 rounded-none text-[10px] font-black uppercase tracking-widest">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-none border-black">
                                                <SelectItem value="user" className="uppercase text-[10px] tracking-widest">USER</SelectItem>
                                                <SelectItem value="admin" className="uppercase text-[10px] tracking-widest">ADMIN</SelectItem>
                                                <SelectItem value="super_admin" className="uppercase text-[10px] tracking-widest">SUPER</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Status</Label>
                                        <Select
                                            value={editData.status}
                                            onValueChange={(val: any) => setEditData({ ...editData, status: val })}
                                        >
                                            <SelectTrigger className="h-10 border-zinc-200 rounded-none text-[10px] font-black uppercase tracking-widest">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-none border-black">
                                                <SelectItem value="active" className="uppercase text-[10px] tracking-widest">ATIVO</SelectItem>
                                                <SelectItem value="inactive" className="uppercase text-[10px] tracking-widest">INATIVO</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        )}
                        <DialogFooter className="mt-8">
                            <Button onClick={handleRunUpdateUser} className="w-full h-11 bg-black text-white hover:bg-zinc-800 rounded-none font-black uppercase tracking-widest">
                                Salvar Alterações
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </AdminPageLayout>
        </PageLayout>
    );
};

export default AdminUsers;
