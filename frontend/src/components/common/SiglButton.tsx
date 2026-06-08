import { Button, type ButtonProps } from 'primereact/button';

/** PrimeReact Button with SIGL default size `small`. */
export function SiglButton({ size = 'small', ...rest }: ButtonProps) {
    return <Button size={size} {...rest} />;
}
