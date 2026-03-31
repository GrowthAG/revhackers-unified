import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/layout/AdminLayout";
import ProposalForm from "@/components/admin/ProposalForm";
import { Loader2 } from "lucide-react";
import { AIProvider } from "@/context/AIContext";

const AdminProposalEdit = () => {
    const { id } = useParams();

    const { data: proposal, isLoading } = useQuery({
        queryKey: ["proposal", id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("proposals")
                .select("*")
                .eq("id", id)
                .single();

            if (error) throw error;
            return data;
        },
    });

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-[500px]">
                    <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <AIProvider>
                <ProposalForm initialData={proposal} isEditing />
            </AIProvider>
        </AdminLayout>
    );
};

export default AdminProposalEdit;
