interface ButtonProps {
    label: string;
    type?: "button" | "submit";
    onClick?: () => void;
}

export const Button = ({ label, type = "button", onClick }: ButtonProps) => (
    <button type={type} onClick={onClick} style={{ marginRight: '5px' }}>
        {label}
    </button>
);