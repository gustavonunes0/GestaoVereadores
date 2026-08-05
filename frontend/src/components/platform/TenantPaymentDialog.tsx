import { FormEvent, useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import {
    tenantsApi,
    type CreateTenantPaymentPayload,
    type TenantPayment,
    type TenantPaymentMethod,
    type TenantPaymentStatus,
    type UpdateTenantPaymentPayload,
} from '../../api/tenants.api';
import { Dropdown, withEmptyOption } from '../ui';
import { useAppToast } from '../../hooks/useAppToast';

const STATUS_OPTIONS: Array<{ label: string; value: TenantPaymentStatus }> = [
    { label: 'Pendente', value: 'PENDING' },
    { label: 'Pago', value: 'PAID' },
    { label: 'Atrasado', value: 'OVERDUE' },
    { label: 'Cancelado', value: 'CANCELLED' },
    { label: 'Isento', value: 'WAIVED' },
];

const METHOD_OPTIONS: Array<{ label: string; value: TenantPaymentMethod }> = [
    { label: 'PIX', value: 'PIX' },
    { label: 'Boleto', value: 'BOLETO' },
    { label: 'Transferência', value: 'TRANSFER' },
    { label: 'Cartão', value: 'CARD' },
    { label: 'Outro', value: 'OTHER' },
];

type Props = {
    visible: boolean;
    tenantId: string;
    payment: TenantPayment | null;
    defaultAmountCents: number;
    onHide: () => void;
    onSaved: () => void;
};

function parseCompetence(value: string): Date | null {
    const m = /^(\d{4})-(\d{2})$/.exec(value);
    if (!m) return null;
    return new Date(Number(m[1]), Number(m[2]) - 1, 1);
}

function toCompetence(date: Date | null): string {
    if (!date) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
}

function toDateInput(iso: string | null | undefined): Date | null {
    if (!iso) return null;
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? null : d;
}

function toIsoDate(date: Date | null): string | null {
    if (!date) return null;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

export function TenantPaymentDialog({
    visible,
    tenantId,
    payment,
    defaultAmountCents,
    onHide,
    onSaved,
}: Props) {
    const { showSuccess, showApiError } = useAppToast();
    const [loading, setLoading] = useState(false);
    const [competence, setCompetence] = useState<Date | null>(null);
    const [amountReais, setAmountReais] = useState<number | null>(null);
    const [dueDate, setDueDate] = useState<Date | null>(null);
    const [paidAt, setPaidAt] = useState<Date | null>(null);
    const [status, setStatus] = useState<TenantPaymentStatus>('PENDING');
    const [method, setMethod] = useState<TenantPaymentMethod | null>(null);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (!visible) return;
        if (payment) {
            setCompetence(parseCompetence(payment.competenceMonth));
            setAmountReais(payment.amountCents / 100);
            setDueDate(toDateInput(payment.dueDate));
            setPaidAt(toDateInput(payment.paidAt));
            setStatus(payment.status);
            setMethod(payment.method);
            setNotes(payment.notes ?? '');
        } else {
            const now = new Date();
            setCompetence(new Date(now.getFullYear(), now.getMonth(), 1));
            setAmountReais(defaultAmountCents / 100);
            setDueDate(new Date(now.getFullYear(), now.getMonth(), 10));
            setPaidAt(null);
            setStatus('PENDING');
            setMethod(null);
            setNotes('');
        }
    }, [visible, payment, defaultAmountCents]);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        const competenceMonth = toCompetence(competence);
        const due = toIsoDate(dueDate);
        if (!competenceMonth || !due || amountReais == null) return;

        setLoading(true);
        try {
            if (payment) {
                const body: UpdateTenantPaymentPayload = {
                    amountCents: Math.round(amountReais * 100),
                    dueDate: due,
                    paidAt: toIsoDate(paidAt),
                    status,
                    method,
                    notes: notes.trim() || null,
                };
                await tenantsApi.updatePayment(tenantId, payment.id, body);
                showSuccess('Pagamento atualizado.');
            } else {
                const body: CreateTenantPaymentPayload = {
                    competenceMonth,
                    amountCents: Math.round(amountReais * 100),
                    dueDate: due,
                    paidAt: toIsoDate(paidAt),
                    status,
                    method,
                    notes: notes.trim() || null,
                };
                await tenantsApi.createPayment(tenantId, body);
                showSuccess('Pagamento registrado.');
            }
            onSaved();
            onHide();
        } catch (err) {
            showApiError(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog
            header={payment ? 'Editar pagamento' : 'Novo pagamento'}
            visible={visible}
            onHide={onHide}
            style={{ width: 'min(480px, 96vw)' }}
            modal
        >
            <form className="sigl-dialog-body" onSubmit={(e) => void handleSubmit(e)}>
                <div className="sigl-filtro-campo">
                    <label htmlFor="pay-comp">Competência</label>
                    <Calendar
                        id="pay-comp"
                        value={competence}
                        onChange={(e) => setCompetence(e.value as Date | null)}
                        view="month"
                        dateFormat="mm/yy"
                        className="w-full"
                        inputClassName="w-full"
                        disabled={Boolean(payment)}
                        required
                    />
                </div>
                <div className="sigl-dialog-grid sigl-dialog-grid-2">
                    <div className="sigl-filtro-campo">
                        <label htmlFor="pay-amount">Valor (R$)</label>
                        <InputNumber
                            id="pay-amount"
                            value={amountReais}
                            onValueChange={(e) => setAmountReais(e.value ?? null)}
                            mode="currency"
                            currency="BRL"
                            locale="pt-BR"
                            className="w-full"
                            inputClassName="w-full"
                            required
                        />
                    </div>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="pay-status">Status</label>
                        <Dropdown
                            id="pay-status"
                            value={status}
                            options={STATUS_OPTIONS}
                            onChange={(v) => setStatus(v as TenantPaymentStatus)}
                            placeholder="Status"
                        />
                    </div>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="pay-due">Vencimento</label>
                        <Calendar
                            id="pay-due"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.value as Date | null)}
                            dateFormat="dd/mm/yy"
                            className="w-full"
                            inputClassName="w-full"
                            required
                        />
                    </div>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="pay-paid">Pago em</label>
                        <Calendar
                            id="pay-paid"
                            value={paidAt}
                            onChange={(e) => setPaidAt(e.value as Date | null)}
                            dateFormat="dd/mm/yy"
                            className="w-full"
                            inputClassName="w-full"
                            showButtonBar
                        />
                    </div>
                    <div className="sigl-filtro-campo sigl-col-full">
                        <label htmlFor="pay-method">Forma de pagamento</label>
                        <Dropdown
                            id="pay-method"
                            value={method ?? ''}
                            options={withEmptyOption(METHOD_OPTIONS, '—', '')}
                            onChange={(v) =>
                                setMethod(v ? (v as TenantPaymentMethod) : null)
                            }
                            placeholder="Selecione"
                        />
                    </div>
                    <div className="sigl-filtro-campo sigl-col-full">
                        <label htmlFor="pay-notes">Observações</label>
                        <InputTextarea
                            id="pay-notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full"
                            rows={2}
                        />
                    </div>
                </div>
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button type="button" label="Cancelar" severity="secondary" onClick={onHide} />
                    <Button
                        type="submit"
                        label={payment ? 'Salvar' : 'Registrar'}
                        icon="pi pi-check"
                        loading={loading}
                    />
                </div>
            </form>
        </Dialog>
    );
}
