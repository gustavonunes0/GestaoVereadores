import type { DropdownOption } from './Dropdown';

export function mapDropdownOptions<T extends object>(
    items: T[],
    labelKey: keyof T,
    valueKey: keyof T,
): DropdownOption[] {
    return items.map((item) => ({
        label: String(item[labelKey as keyof T]),
        value: item[valueKey as keyof T] as string | number,
    }));
}

export function withEmptyOption(
    options: DropdownOption[],
    label = 'Todos',
    value: string | number = '',
): DropdownOption[] {
    return [{ label, value }, ...options];
}
