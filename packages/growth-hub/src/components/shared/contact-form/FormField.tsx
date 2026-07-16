
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Option {
  value: string;
  label: string;
}

interface FormFieldProps {
  type: 'input' | 'textarea' | 'select';
  name: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange?: (value: string) => void;
  options?: Option[];
  required?: boolean;
}

const FormField = ({
  type,
  name,
  placeholder,
  value,
  onChange,
  onSelectChange,
  options = [],
  required = false
}: FormFieldProps) => {
  if (type === 'textarea') {
    return (
      <div>
        <Textarea
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          rows={4}
          required={required}
        />
      </div>
    );
  }

  if (type === 'select' && onSelectChange) {
    // For select elements we need a dummy onChange handler even though we use onSelectChange
    return (
      <div>
        <Select value={value} onValueChange={(val) => onSelectChange(val)}>
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div>
      <Input
        name={name}
        type={name === 'email' ? 'email' : 'text'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
      />
    </div>
  );
};

export default FormField;
