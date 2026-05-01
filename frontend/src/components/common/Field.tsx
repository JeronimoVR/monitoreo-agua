interface FieldProps {
    label: string;
    type: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
}

export const Field = ({ label, type, name, value, onChange, required }: FieldProps) => (
    <div style={{ marginBottom: '10px' }}>
        <label>{label}: </label>
        <input type={type} name={name} value={value} onChange={onChange} required={required} />
    </div>
);