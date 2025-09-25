import { ReactNode, ComponentProps } from 'react';
import clsx from 'clsx';

type ButtonProps = {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
} & ComponentProps<'button'>;

const Button = ({
  children,
  onClick,
  variant = 'primary',
  className,
  disabled = false,
  ...props
}: ButtonProps) => {
  const baseStyles = 'px-6 py-3 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zone-dark disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-zone-blue hover:bg-zone-blue-dark text-white focus:ring-zone-blue',
    secondary: 'bg-zone-gray hover:bg-zone-border text-zone-light focus:ring-zone-gray',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;