import {
  createContext,
  useCallback,
  useContext,
  useRef,
  type ReactNode,
} from 'react';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { getApiErrorMessage } from '../utils/apiErrorMessage';

type ToastSeverity = 'success' | 'info' | 'warn' | 'error';

type AppToastContextValue = {
  showToast: (severity: ToastSeverity, summary: string, detail?: string) => void;
  showSuccess: (detail: string, summary?: string) => void;
  showError: (detail: string, summary?: string) => void;
  showApiError: (error: unknown, summary?: string) => void;
  confirmDestructive: (
    message: string,
    onAccept: () => void | Promise<void>,
    header?: string,
  ) => void;
};

const AppToastContext = createContext<AppToastContextValue | null>(null);

export function AppFeedbackProvider({ children }: { children: ReactNode }) {
  const toastRef = useRef<Toast>(null);

  const showToast = useCallback(
    (severity: ToastSeverity, summary: string, detail?: string) => {
      toastRef.current?.show({ severity, summary, detail, life: severity === 'error' ? 6000 : 4000 });
    },
    [],
  );

  const showSuccess = useCallback(
    (detail: string, summary = 'Sucesso') => showToast('success', summary, detail),
    [showToast],
  );

  const showError = useCallback(
    (detail: string, summary = 'Erro') => showToast('error', summary, detail),
    [showToast],
  );

  const showApiError = useCallback(
    (error: unknown, summary = 'Erro') => {
      showError(getApiErrorMessage(error), summary);
    },
    [showError],
  );

  const confirmDestructive = useCallback(
    (
      message: string,
      onAccept: () => void | Promise<void>,
      header = 'Confirmar exclusão',
    ) => {
      confirmDialog({
        header,
        message,
        icon: 'pi pi-exclamation-triangle',
        acceptClassName: 'p-button-danger',
        acceptLabel: 'Confirmar',
        rejectLabel: 'Cancelar',
        accept: () => void onAccept(),
      });
    },
    [],
  );

  const value: AppToastContextValue = {
    showToast,
    showSuccess,
    showError,
    showApiError,
    confirmDestructive,
  };

  return (
    <AppToastContext.Provider value={value}>
      <Toast ref={toastRef} position="top-right" />
      <ConfirmDialog />
      {children}
    </AppToastContext.Provider>
  );
}

export function useAppToast() {
  const ctx = useContext(AppToastContext);
  if (!ctx) {
    throw new Error('useAppToast deve ser usado dentro de AppFeedbackProvider');
  }
  return ctx;
}
