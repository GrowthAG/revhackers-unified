import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AdminPageLayout from "@/components/layout/AdminPageLayout";
import AdminLayout from "@/components/layout/AdminLayout";
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
import { Loader2, Search, MoreHorizontal, Plus, Trash2, Edit2, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
            const { error: functionError } = await supabase.functions.invoke('invite-member', {
                body: {
                    email: inviteData.email,
                    role: inviteData.role,
                    redirectTo: `${window.location.origin}/reset-password`
                }
            });

            if (functionError) throw new Error(functionError.message || "Erro ao disparar e-mail de convite");

            await supabase
                .from("invitations")
                .insert([{
                    email: inviteData.email,
                    role: inviteData.role,
                    invited_by: currentUser?.id,
                    status: 'pending'
                }]);

            toast({
                title: "Convite enviado",
                description: `Enviamos um email para ${inviteData.email}.`
            });

            setIsInviteModalOpen(false);
            setInviteData({ email: "", role: "user" });
            fetchInvitations();
        } catch (error: any) {
            toast({
                title: "Erro ao convidar",
                description: error.message,
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
                description: "Você não tem permissão para alterar este usuário.",
                variant: "destructive"
            });
            return;
        }

        setUpdating(userId);
        try {
            const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
            if (error) throw error;
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as any } : u));
            toast({ title: "Permissão atualizada" });
        } catch (error: any) {
            toast({ title: "Erro", description: error.message, variant: "destructive" });
        } finally {
            setUpdating(null);
        }
    };

    const handleDeleteUser = async (user: UserProfile) => {
        if (!confirm(`Tem certeza que deseja remover ${user.email}?`)) return;
        setUpdating(user.id);
        try {
            const { data, error } = await supabase.functions.invoke('delete-user', { body: { userId: user.id } });
            if (error) throw error;
            if (data?.error) throw new Error(data.error);
            if (data?.success === false) throw new Error("Falha desconhecida no provedor interno.");
            
            setUsers(users.filter(u => u.id !== user.id));
            toast({ title: "Usuário removido" });
        } catch (error: any) {
            toast({ title: "Erro", description: error.message, variant: "destructive" });
        } finally {
            setUpdating(null);
        }
    };

    const handleRunUpdateUser = async () => {
        if (!editData) return;
        setUpdating(editData.id);
        try {
            const { error } = await supabase
                .from("profiles")
                .update({ full_name: editData.full_name, role: editData.role, status: editData.status })
                .eq("id", editData.id);

            if (error) throw error;
            setUsers(users.map(u => u.id === editData.id ? editData : u));
            toast({ title: "Perfil atualizado" });
            setIsEditModalOpen(false);
        } catch (error: any) {
            toast({ title: "Erro", description: error.message, variant: "destructive" });
        } finally {
            setUpdating(null);
        }
    };

    const filteredUsers = users.filter(user =>
        (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || "") ||
        (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || "")
    );

    const StatusBadge = ({ status }: { status: string }) => {
        const styles = {
            active: "bg-[#00CC6A]/10 text-[#00CC6A] border-[#00CC6A]/20",
            inactive: "bg-zinc-50 text-zinc-500 border-zinc-100",
            pending: "bg-zinc-100 text-zinc-600 border-zinc-200"
        };
        const labels = { active: "Ativo", inactive: "Inativo", pending: "Pendente" };

        return (
            <span className={`px-2.5 py-0.5 text-tiny font-bold border ${styles[status as keyof typeof styles] || styles.pending}`}>
                {labels[status as keyof typeof labels] || status}
            </span>
        );
    };

    const RoleBadge = ({ role }: { role: string }) => {
        const labels = { super_admin: "Super Admin", admin: "Admin", user: "Membro" };
        return <span className="text-sm text-zinc-600">{labels[role as keyof typeof labels] || role}</span>;
    };

    const handleEditClick = (user: UserProfile) => {
        setEditData(user);
        setIsEditModalOpen(true);
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-zinc-300" />
            </div>
        );
    }

    return (
        <AdminLayout>
            <div className="flex flex-col min-h-screen">
                <AdminPageLayout
                    title="Membros & Permissões"
                    description="Gerencie quem tem acesso ao seu workspace."
                    backTo="/admin"
                    backLabel="Voltar ao Hub"
                    actions={
                        <Button
                            onClick={() => setIsInviteModalOpen(true)}
                            className="bg-black text-white hover:bg-zinc-800 rounded-sm h-9 px-4 text-xs font-bold uppercase tracking-widest shadow-sm transition-all"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Adicionar membro
                        </Button>
                    }
                >
                    <div className="bg-white rounded-sm border border-zinc-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-white">
                            <div className="relative max-w-sm w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                <Input
                                    placeholder="BUSCAR..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 h-9 border-zinc-200 rounded-sm bg-zinc-50/50 focus:bg-white focus:ring-1 focus:ring-black focus:border-black text-xs font-medium uppercase tracking-wide shadow-none"
                                />
                            </div>
                            <Tabs defaultValue="active" className="w-auto">
                                <TabsList className="bg-zinc-100/50 h-9 p-1 rounded-sm">
                                    <TabsTrigger value="active" className="text-xxs font-bold uppercase tracking-wider rounded-sm px-3 h-7 data-[state=active]:bg-white data-[state=active]:shadow-sm text-zinc-600">Ativos</TabsTrigger>
                                    <TabsTrigger value="pending" className="text-xxs font-bold uppercase tracking-wider rounded-sm px-3 h-7 data-[state=active]:bg-white data-[state=active]:shadow-sm text-zinc-600">Convites</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>

                        <Tabs defaultValue="active" className="w-full">
                            <TabsContent value="active" className="m-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-zinc-50/50 hover:bg-zinc-50/50 border-b border-zinc-100">
                                            <TableHead className="text-xxs font-black uppercase tracking-widest text-zinc-400 pl-6 py-3 h-10 w-[300px]">Usuário</TableHead>
                                            <TableHead className="text-xxs font-black uppercase tracking-widest text-zinc-400 py-3 h-10">Cargo</TableHead>
                                            <TableHead className="text-xxs font-black uppercase tracking-widest text-zinc-400 py-3 h-10">Status</TableHead>
                                            <TableHead className="text-xxs font-black uppercase tracking-widest text-zinc-400 py-3 h-10 text-right pr-6">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredUsers.map((user) => (
                                            <TableRow key={user.id} className="hover:bg-zinc-50/30 transition-colors border-b border-zinc-50 last:border-0">
                                                <TableCell className="py-3 pl-6">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-8 w-8 rounded-sm border border-zinc-100 bg-white">
                                                            <AvatarImage src={user.avatar_url} />
                                                            <AvatarFallback className="bg-zinc-50 text-zinc-400 text-xs font-bold rounded-sm">
                                                                {user.full_name?.substring(0, 2).toUpperCase() || "US"}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-zinc-900">{user.full_name || "Usuário"}</span>
                                                            <span className="text-xxs font-medium text-zinc-500">{user.email}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-3">
                                                    <div className="flex items-center gap-2">
                                                        <RoleBadge role={user.role} />
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-3">
                                                    <StatusBadge status={user.status || 'pending'} />
                                                </TableCell>
                                                <TableCell className="py-3 pr-6 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-sm">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-[160px] rounded-sm border-zinc-200 shadow-sm p-1 bg-white">
                                                            <DropdownMenuLabel className="text-xxs uppercase font-bold text-zinc-400 px-2 py-1.5">Gerenciar</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => handleEditClick(user)} className="text-xs font-medium rounded-sm px-2 py-1.5 focus:bg-zinc-100 cursor-pointer">
                                                                <Edit2 className="mr-2 h-3.5 w-3.5" /> Editar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator className="bg-zinc-100 my-1" />
                                                            <DropdownMenuItem onClick={() => handleDeleteUser(user)} className="text-xs font-medium rounded-sm px-2 py-1.5 focus:bg-zinc-100 text-zinc-500 focus:text-zinc-900 cursor-pointer">
                                                                <Trash2 className="mr-2 h-3.5 w-3.5" /> Remover
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TabsContent>

                            <TabsContent value="pending" className="m-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-zinc-50/50 hover:bg-zinc-50/50 border-b border-zinc-100">
                                            <TableHead className="text-xxs font-black uppercase tracking-widest text-zinc-400 pl-6 py-3 h-10">Email</TableHead>
                                            <TableHead className="text-xxs font-black uppercase tracking-widest text-zinc-400 py-3 h-10">Permissão</TableHead>
                                            <TableHead className="text-xxs font-black uppercase tracking-widest text-zinc-400 py-3 h-10 text-right pr-6">Enviado em</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {invitations.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={3} className="h-48 text-center">
                                                    <div className="flex flex-col items-center justify-center text-zinc-400">
                                                        <Mail className="h-8 w-8 mb-2 opacity-20" />
                                                        <span className="text-xs font-medium uppercase tracking-wide">Nenhum convite pendente.</span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : invitations.map((invite) => (
                                            <TableRow key={invite.id} className="hover:bg-zinc-50/30 transition-colors border-b border-zinc-50 last:border-0">
                                                <TableCell className="py-3 pl-6 text-sm font-medium text-zinc-700">{invite.email}</TableCell>
                                                <TableCell className="py-3">
                                                    <span className="inline-flex items-center px-2 py-1 rounded-sm bg-zinc-50 border border-zinc-100 text-xxs uppercase font-bold text-zinc-600">
                                                        {invite.role}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="py-3 pr-6 text-right text-xs font-medium text-zinc-400">
                                                    {new Date(invite.created_at).toLocaleDateString('pt-BR')}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TabsContent>
                        </Tabs>
                    </div>


                    {/* Invite Modal */}
                    <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
                        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden bg-white border border-zinc-200 shadow-sm rounded-sm gap-0">
                            <DialogHeader className="px-6 py-6 border-b border-zinc-50">
                                <DialogTitle className="text-lg font-bold text-zinc-900 tracking-tight">Convidar membro</DialogTitle>
                                <DialogDescription className="text-xs text-zinc-500">
                                    Envie um convite por e-mail para adicionar um novo membro ao time.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wide text-zinc-700">Email</Label>
                                    <Input
                                        id="email"
                                        value={inviteData.email}
                                        onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                                        className="h-10 border-zinc-200 rounded-sm focus:ring-1 focus:ring-black focus:border-black shadow-sm"
                                        placeholder="exemplo@empresa.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="role" className="text-xs font-bold uppercase tracking-wide text-zinc-700">Função</Label>
                                    <Select
                                        value={inviteData.role}
                                        onValueChange={(val) => setInviteData({ ...inviteData, role: val })}
                                    >
                                        <SelectTrigger className="h-10 border-zinc-200 rounded-sm focus:ring-1 focus:ring-black focus:border-black shadow-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-sm border-zinc-200 shadow-sm bg-white">
                                            <SelectItem value="user">Membro</SelectItem>
                                            <SelectItem value="admin">Administrador</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsInviteModalOpen(false)} className="h-9 rounded-sm border-zinc-200 text-zinc-600 hover:bg-white hover:text-black uppercase text-xxs font-bold tracking-widest">
                                    Cancelar
                                </Button>
                                <Button onClick={handleInvite} disabled={inviting} className="h-9 rounded-sm bg-black text-white hover:bg-zinc-800 shadow-sm uppercase text-xxs font-bold tracking-widest">
                                    {inviting ? "Enviando..." : "Enviar convite"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Edit Modal */}
                    <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden bg-white border border-zinc-200 shadow-sm rounded-sm gap-0">
                            <DialogHeader className="px-6 py-6 border-b border-zinc-50">
                                <DialogTitle className="text-lg font-bold text-zinc-900 tracking-tight">Editar usuário</DialogTitle>
                            </DialogHeader>
                            {editData && (
                                <div className="p-6 space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wide text-zinc-700">Nome</Label>
                                        <Input
                                            value={editData.full_name || ''}
                                            onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                                            className="h-10 border-zinc-200 rounded-sm shadow-sm focus:ring-1 focus:ring-black focus:border-black"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wide text-zinc-700">Cargo</Label>
                                            <Select
                                                value={editData.role}
                                                onValueChange={(val: any) => setEditData({ ...editData, role: val })}
                                            >
                                                <SelectTrigger className="h-10 border-zinc-200 rounded-sm shadow-sm focus:ring-1 focus:ring-black focus:border-black">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-sm bg-white shadow-sm border-zinc-200">
                                                    <SelectItem value="user">Membro</SelectItem>
                                                    <SelectItem value="admin">Admin</SelectItem>
                                                    <SelectItem value="super_admin">Super Admin</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wide text-zinc-700">Status</Label>
                                            <Select
                                                value={editData.status}
                                                onValueChange={(val: any) => setEditData({ ...editData, status: val })}
                                            >
                                                <SelectTrigger className="h-10 border-zinc-200 rounded-sm shadow-sm focus:ring-1 focus:ring-black focus:border-black">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-sm bg-white shadow-sm border-zinc-200">
                                                    <SelectItem value="active">Ativo</SelectItem>
                                                    <SelectItem value="inactive">Inativo</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <DialogFooter className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsEditModalOpen(false)} className="h-9 rounded-sm border-zinc-200 text-zinc-600 hover:bg-white hover:text-black uppercase text-xxs font-bold tracking-widest">
                                    Cancelar
                                </Button>
                                <Button onClick={handleRunUpdateUser} className="h-9 rounded-sm bg-black text-white hover:bg-zinc-800 shadow-sm uppercase text-xxs font-bold tracking-widest">
                                    Salvar
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </AdminPageLayout>
            </div >
        </AdminLayout >
    );
};

export default AdminUsers;
