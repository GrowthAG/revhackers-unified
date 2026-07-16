
export interface DownloadFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  industry: string;
  role: string;
  roleType: string;
  agree: boolean;
}

export interface DownloadFormProps {
  materialId: string;
  materialType: string;
  onSubmit: () => void;
  linkMaterial?: string;  // Novo campo para o link do material
}
