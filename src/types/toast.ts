import {
  ToastActionElement,
  ToastProps as PropsToast,
} from "@/components/ui/toast";

export type ToastProps = {
  title?: string;
  description?: string;
  action?: ToastActionElement;
} & Pick<PropsToast, "variant">;

export interface Toast extends ToastProps {
  id: string;
  dismiss: () => void;
  update: (props: PropsToast) => void;
}
