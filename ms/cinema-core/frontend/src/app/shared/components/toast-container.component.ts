export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  timerId?: any;
}

export class ToastContainerComponent {
  public toasts: ToastMessage[] = [];

  public show(type: 'success' | 'error' | 'warning' | 'info', title: string, message: string, autoClose: boolean = false): void {
    const toast: ToastMessage = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      title,
      message,
      timestamp: new Date()
    };

    if (autoClose) {
      toast.timerId = setTimeout(() => {
        this.remove(toast.id);
      }, 4000);
    }

    this.toasts.push(toast);
  }

  public remove(id: string): void {
    const toast = this.toasts.find((t) => t.id === id);
    if (toast?.timerId) {
      clearTimeout(toast.timerId);
    }
    this.toasts = this.toasts.filter((t) => t.id !== id);
  }
}
