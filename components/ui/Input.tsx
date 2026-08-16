interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  label?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

export default function Input({ 
  type = 'text',
  placeholder,
  label,
  value,
  onChange,
  error,
  disabled = false,
  required = false
}: InputProps) {

  const styles = {
    container: "w-full",
    label: "block text-sm font-medium text-gray-700 mb-2",
    input: `w-full px-4 py-2 border rounded-lg transition-all
      ${error 
        ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-200' 
        : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
      }
      ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
      outline-none`,
    error: "mt-1 text-sm text-red-600",
    required: "text-red-500 ml-1"
  };

  return (
    <div className={styles.container}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={styles.input}
      />

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}