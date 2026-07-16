
export type FormType = 'contact' | 'diagnosis';

export interface ContactFormData {
  name: string;
  email: string;
  company: string;
  phone: string;
  industry: string;
  message: string;
  role: string;
}

export interface ContactFormProps {
  formType?: FormType;
}
