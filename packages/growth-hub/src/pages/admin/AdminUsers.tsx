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
            // 1. Chamar a Edge Function para disparar o e-mail real via Supabase Auth
            const { data: functionData, error: functionError } = await supabase.functions.invoke('invite-member', {
                body: {
                    email: inviteData.email,
                    role: inviteData.role,
                    redirectTo: `${window.location.origin}/reset-password`
                }
            });

            if (functionError) throw new Error(functionError.message || "Erro ao disparar e-mail de convite");

            // 2. Registrar o convite na nossa tabela local para rastreamento
            const { error: dbError } = await supabase
                .from("invitations")
                .insert([{
                    email: inviteData.email,
                    role: inviteData.role,
                    invited_by: currentUser?.id,
                    status: 'pending'
                }]);

            if (dbError) {
                console.warn("Convite enviado, mas registro local falhou:", dbError);
            }

            toast({
                title: "Convite Enviado!",
                description: `O e-mail de acesso foi enviado para ${inviteData.email}.`
            });

            setIsInviteModalOpen(false);
            setInviteData({ email: "", role: "user" });
            fetchInvitations();
        } catch (error: any) {
            console.error("Erro no fluxo de convite:", error);
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

        // Hierarquia: Super Admin > Admin > User
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

        if (!confirm(`TEM CERTEZA QUE DESEJA EXCLUIR ${user.full_name?.toUpperCase() || user.email}? ESTA AÇÃO É IRREVERSÍVEL.`)) return;

        setUpdating(user.id);
        try {
            const { data, error } = await supabase.functions.invoke('delete-user', {
                body: { userId: user.id }
            });

            if (error) throw error;

            setUsers(users.filter(u => u.id !== user.id));
            toast({ title: "Usuário excluído com sucesso." });
        } catch (error: any) {
            console.error("Erro ao excluir usuário:", error);
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
        (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || "") ||
        (user.username?.toLowerCase().includes(searchTerm.toLowerCase()) || "")
    );

    const getRoleBadge = (role: string) => {
        switch (role) {
            case "super_admin": return <Badge className="bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20">Super Admin</Badge>;
            case "admin": return <Badge className="bg-revgreen/10 text-revgreen border border-revgreen/20 hover:bg-revgreen/20">Admin</Badge>;
            default: return <Badge variant="outline" className="bg-white/5 text-gray-400 border-white/10 hover:bg-white/10">User</Badge>;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "active": return <Badge className="bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 flex w-fit gap-1 rounded-sm"><CheckCircle className="w-3 h-3" /> Ativo</Badge>;
            case "inactive": return <Badge className="bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 flex w-fit gap-1 rounded-sm"><XCircle className="w-3 h-3" /> Inativo</Badge>;
            default: return <Badge className="bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20 flex w-fit gap-1 rounded-sm"><ShieldAlert className="w-3 h-3" /> Pendente</Badge>;
        }
    };

    if (loading) {
        return (
            <PageLayout>
                <div className="flex h-[50vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            {/* ... AdminPageLayout ... */}
            <AdminPageLayout
                title="Gestão de Usuários"
                description="Gerencie permissões e acessos ao sistema."
                backTo="/admin"
                backLabel="Voltar ao Dashboard"
            >
                <div className="space-y-12">
                    {/* ... Toolbar ... */}
                    <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
                        {/* ... Search ... */}
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 stroke-[2.5]" />
                            <Input
                                placeholder="BUSCAR POR NOME OU E-MAIL..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 h-12 bg-white border-zinc-200 rounded-none focus-visible:ring-0 focus-visible:border-black text-[11px] font-bold uppercase tracking-widest placeholder:text-zinc-300 transition-all"
                            />
                        </div>

                        {/* ... Invite Dialog ... */}
                        <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
                            {/* ... Content ... */}
                            <DialogTrigger asChild>
                                <Button className="bg-black text-white hover:bg-zinc-800 font-black uppercase tracking-[0.25em] h-12 px-8 rounded-none shadow-none border border-black flex items-center gap-3">
                                    <Plus className="w-4 h-4 stroke-[3]" /> Convidar Membro
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md bg-white border border-black p-10 rounded-none">
                                {/* ... Same Invite Content ... */}
                                <DialogHeader className="mb-8">
                                    <DialogTitle className="text-xl font-black uppercase tracking-[0.2em] text-black">Novo Convite</DialogTitle>
                                    <DialogDescription className="text-[10px] text-zinc-400 uppercase tracking-widest mt-2 leading-relaxed">
                                        DEFINA O ACESSO PARA O NOVO COLABORADOR. ELE RECEBERÁ UM LINK POR E-MAIL.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">E-mail Corporativo</Label>
                                        <Input
                                            type="email"
                                            placeholder="EX: NOME@REVHACKERS.COM.BR"
                                            value={inviteData.email}
                                            onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                                            className="h-12 border-zinc-200 rounded-none focus:border-black transition-all uppercase text-xs tracking-widest"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Nível de Acesso</Label>
                                        <Select
                                            value={inviteData.role}
                                            onValueChange={(val) => setInviteData({ ...inviteData, role: val })}
                                        >
                                            <SelectTrigger className="h-12 border-zinc-200 rounded-none text-xs uppercase tracking-widest font-bold">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-none border-black">
                                                <SelectItem value="user" className="uppercase text-[10px] tracking-widest">Colaborador (User)</SelectItem>
                                                <SelectItem value="admin" className="uppercase text-[10px] tracking-widest">Administrador (Admin)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <DialogFooter className="mt-12">
                                    <Button
                                        onClick={handleInvite}
                                        disabled={inviting || !inviteData.email}
                                        className="w-full bg-black text-white hover:bg-zinc-800 font-black uppercase tracking-[0.3em] h-14 rounded-none transition-all"
                                    >
                                        {inviting ? "PROCESSANDO..." : "ENVIAR CONVITE"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        {/* EDIT MEMBER DIALOG */}
                        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                            <DialogContent className="max-w-md bg-white border border-black p-10 rounded-none">
                                <DialogHeader className="mb-0">
                                    <DialogTitle className="text-xl font-black uppercase tracking-[0.2em] text-black">Editar Membro</DialogTitle>
                                    <DialogDescription className="text-[10px] text-zinc-400 uppercase tracking-widest mt-2 leading-relaxed">
                                        ATUALIZE AS INFORMAÇÕES DE CADASTRO DO USUÁRIO.
                                    </DialogDescription>
                                </DialogHeader>

                                {editData && (
                                    <div className="space-y-8 mt-8">
                                        {/* Avatar / Identity Readonly */}
                                        <div className="flex items-center gap-4 p-4 bg-zinc-50 border border-zinc-100">
                                            <div className="w-10 h-10 bg-white border border-zinc-200 flex items-center justify-center overflow-hidden">
                                                {editData.avatar_url ? (
                                                    <img src={editData.avatar_url} alt={editData.full_name} className="w-full h-full object-cover grayscale" />
                                                ) : (
                                                    <User className="h-5 w-5 text-zinc-300" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">Editando usuário</div>
                                                <div className="text-xs font-black uppercase tracking-widest text-black">{editData.email}</div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Nome Completo</Label>
                                            <Input
                                                value={editData.full_name || ''}
                                                onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                                                className="h-12 border-zinc-200 rounded-none focus:border-black transition-all uppercase text-xs tracking-widest font-bold"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Nível de Acesso</Label>
                                                <Select
                                                    value={editData.role}
                                                    onValueChange={(val: any) => setEditData({ ...editData, role: val })}
                                                >
                                                    <SelectTrigger className="h-12 border-zinc-200 rounded-none text-[10px] uppercase tracking-widest font-bold">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-none border-black">
                                                        <SelectItem value="user" className="uppercase text-[10px] tracking-widest">Colaborador</SelectItem>
                                                        <SelectItem value="admin" className="uppercase text-[10px] tracking-widest">Admin</SelectItem>
                                                        <SelectItem value="super_admin" className="uppercase text-[10px] tracking-widest">Super Admin</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Status</Label>
                                                <Select
                                                    value={editData.status}
                                                    onValueChange={(val: any) => setEditData({ ...editData, status: val })}
                                                >
                                                    <SelectTrigger className="h-12 border-zinc-200 rounded-none text-[10px] uppercase tracking-widest font-bold">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-none border-black">
                                                        <SelectItem value="pending" className="uppercase text-[10px] tracking-widest">Pendente</SelectItem>
                                                        <SelectItem value="active" className="uppercase text-[10px] tracking-widest">Ativo</SelectItem>
                                                        <SelectItem value="inactive" className="uppercase text-[10px] tracking-widest">Inativo</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <DialogFooter className="mt-12">
                                    <Button
                                        onClick={handleRunUpdateUser}
                                        disabled={!!updating}
                                        className="w-full bg-black text-white hover:bg-zinc-800 font-black uppercase tracking-[0.3em] h-14 rounded-none transition-all"
                                    >
                                        {updating ? "SALVANDO..." : "SALVAR ALTERAÇÕES"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* ... Tabs ... */}
                    <Tabs defaultValue="active" className="w-full">
                        {/* ... TabsList ... */}
                        <TabsList className="flex w-full bg-transparent border-b border-zinc-200 h-auto p-0 gap-10 mb-8 rounded-none">
                            <TabsTrigger
                                value="active"
                                className="flex items-center gap-3 px-0 py-5 data-[state=active]:bg-transparent data-[state=active]:text-black data-[state=active]:border-b-2 data-[state=active]:border-black text-zinc-400 hover:text-black transition-all rounded-none uppercase tracking-[0.25em] font-black text-[11px]"
                            >
                                <Users className="w-4 h-4 stroke-[2]" /> Membros Ativos
                                <span className="ml-2 bg-zinc-100 px-2 py-0.5 text-[9px] text-zinc-500">{users.length}</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="pending"
                                className="flex items-center gap-3 px-0 py-5 data-[state=active]:bg-transparent data-[state=active]:text-black data-[state=active]:border-b-2 data-[state=active]:border-black text-zinc-400 hover:text-black transition-all rounded-none uppercase tracking-[0.25em] font-black text-[11px]"
                            >
                                <Mail className="w-4 h-4 stroke-[2]" /> Convites Pendentes
                                <span className="ml-2 bg-zinc-100 px-2 py-0.5 text-[9px] text-zinc-500">{invitations.length}</span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="active" className="animate-in fade-in-50 duration-500">
                            {/* ... Table ... */}
                            <div className="bg-white border border-zinc-200 overflow-hidden">
                                <Table>
                                    {/* ... TableHeader ... */}
                                    <TableHeader className="bg-white border-b border-zinc-200">
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="w-[350px] text-black font-black uppercase tracking-[0.25em] text-[10px] py-10 pl-8 text-left">IDENTIFICAÇÃO</TableHead>
                                            <TableHead className="text-black font-black uppercase tracking-[0.25em] text-[10px] py-10 text-left">PERMISSÕES</TableHead>
                                            <TableHead className="text-black font-black uppercase tracking-[0.25em] text-[10px] py-10 text-left">STATUS</TableHead>
                                            <TableHead className="text-black font-black uppercase tracking-[0.25em] text-[10px] py-10 text-left">DATA</TableHead>
                                            <TableHead className="text-right text-black font-black uppercase tracking-[0.25em] text-[10px] py-10 pr-8">AÇÕES</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredUsers.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-32 text-center text-[10px] text-zinc-400 uppercase tracking-widest">Nenhum membro encontrado.</TableCell>
                                            </TableRow>
                                        ) : filteredUsers.map((user) => (
                                            <TableRow key={user.id} className="hover:bg-zinc-50/50 transition-colors border-zinc-100">
                                                {/* ... Table Cells ... */}
                                                <TableCell className="pl-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-zinc-50 border border-zinc-100 flex items-center justify-center overflow-hidden">
                                                            {user.avatar_url ? (
                                                                <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover grayscale" />
                                                            ) : (
                                                                <User className="h-5 w-5 text-zinc-300" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-black text-black uppercase tracking-widest text-xs mb-1">{user.full_name || "Membro RH"}</div>
                                                            <div className="text-[9px] text-zinc-400 uppercase tracking-widest font-medium">{user.email || user.username || "SEM E-MAIL"}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-6">
                                                    {/* ... Select Role ... */}
                                                    <Select
                                                        defaultValue={user.role || 'user'}
                                                        onValueChange={(val) => handleRoleChange(user.id, val)}
                                                        disabled={updating === user.id}
                                                    >
                                                        <SelectTrigger className="w-[160px] h-10 border-zinc-200 rounded-none text-[9px] font-black uppercase tracking-widest text-black shadow-none bg-white focus:ring-0 focus:border-black">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-none border-black">
                                                            <SelectItem value="user" className="uppercase text-[9px] tracking-widest">Colaborador</SelectItem>
                                                            <SelectItem value="admin" className="uppercase text-[9px] tracking-widest">Admin</SelectItem>
                                                            <SelectItem value="super_admin" className="uppercase text-[9px] tracking-widest">Super Admin</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell className="py-6">
                                                    {/* ... Select Status ... */}
                                                    <Select
                                                        defaultValue={user.status || 'pending'}
                                                        onValueChange={(val) => handleStatusChange(user.id, val)}
                                                        disabled={updating === user.id}
                                                    >
                                                        <SelectTrigger className="w-fit h-auto p-0 border-0 shadow-none hover:bg-transparent bg-transparent ring-0 focus:ring-0">
                                                            {getStatusBadge(user.status || 'pending')}
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-none border-black">
                                                            <SelectItem value="pending" className="uppercase text-[9px] tracking-widest pl-2">Pendente</SelectItem>
                                                            <SelectItem value="active" className="uppercase text-[9px] tracking-widest pl-2">Ativo</SelectItem>
                                                            <SelectItem value="inactive" className="uppercase text-[9px] tracking-widest pl-2">Inativo</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 py-6">
                                                    {new Date(user.created_at).toLocaleDateString('pt-BR')}
                                                </TableCell>
                                                <TableCell className="text-right pr-8 py-6">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleEditClick(user)}
                                                            className="h-9 w-9 text-zinc-300 hover:text-black hover:bg-zinc-100 rounded-none transition-all"
                                                        >
                                                            <Edit2 className="h-4 w-4 stroke-[2]" />
                                                        </Button>

                                                        {userRole && (
                                                            <>
                                                                {/* Only show delete if hierarchy allows */}
                                                                {((userRole === 'super_admin' && user.role !== 'super_admin') ||
                                                                    (userRole === 'admin' && user.role === 'user')) && (
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            disabled={updating === user.id}
                                                                            onClick={() => handleDeleteUser(user)}
                                                                            className="h-9 w-9 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-none transition-all"
                                                                        >
                                                                            <Trash2 className="h-4 w-4 stroke-[2]" />
                                                                        </Button>
                                                                    )}
                                                            </>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </TabsContent>

                        <TabsContent value="pending" className="animate-in fade-in-50 duration-500">
                            <div className="bg-white border border-zinc-200 overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-white border-b border-zinc-200">
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="text-black font-black uppercase tracking-[0.25em] text-[10px] py-10">E-MAIL DO CONVITE</TableHead>
                                            <TableHead className="text-black font-black uppercase tracking-[0.25em] text-[10px] py-10">PERMISSÃO PRETENDIDA</TableHead>
                                            <TableHead className="text-black font-black uppercase tracking-[0.25em] text-[10px] py-10">STATUS</TableHead>
                                            <TableHead className="text-right text-black font-black uppercase tracking-[0.25em] text-[10px] py-10 pr-8">ENVIADO EM</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {invitations.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-48 text-center">
                                                    <div className="flex flex-col items-center gap-4">
                                                        <Mail className="w-8 h-8 text-zinc-100 stroke-[1.5]" />
                                                        <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Nenhum convite pendente no momento.</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : invitations.map((invite) => (
                                            <TableRow key={invite.id} className="hover:bg-zinc-50/50 transition-colors border-zinc-100">
                                                <TableCell className="pl-8 py-8">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-zinc-50 border border-dashed border-zinc-200 flex items-center justify-center">
                                                            <Mail className="w-4 h-4 text-zinc-300 stroke-[2]" />
                                                        </div>
                                                        <span className="font-bold text-black uppercase tracking-widest text-[11px]">{invite.email}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-8">
                                                    <Badge className="bg-zinc-100 text-zinc-500 px-3 py-1 rounded-none uppercase tracking-widest text-[9px] font-black border-none">
                                                        {invite.role}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="py-8">
                                                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-50 w-fit px-3 py-1">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 animate-pulse" />
                                                        Aguardando Cadastro
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right text-[10px] font-bold uppercase tracking-widest text-zinc-400 pr-8 py-8">
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
            </AdminPageLayout>
        </PageLayout>
    );
};

export default AdminUsers;
