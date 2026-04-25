'use client';

import { useEffect, useState } from 'react';
import type { ToastProps } from '@/components/ui/toast';

type ToastInput = Omit<ToastProps, 'id'> & {
  title?: React.ReactNode;
  description?: React.ReactNode;
};

type ToastWithId = ToastInput & { id: string };

const TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 5000;

const listeners: Array<(toasts: ToastWithId[]) => void> = [];
let memoryState: ToastWithId[] = [];

function dispatch(next: ToastWithId[]) {
  memoryState = next.slice(0, TOAST_LIMIT);
  for (const l of listeners) l(memoryState);
}

export function toast(input: ToastInput) {
  const id = crypto.randomUUID();
  const next = [{ ...input, id }, ...memoryState];
  dispatch(next);
  setTimeout(() => {
    dispatch(memoryState.filter((t) => t.id !== id));
  }, TOAST_REMOVE_DELAY);
  return { id };
}

export function useToast() {
  const [state, setState] = useState<ToastWithId[]>(memoryState);
  useEffect(() => {
    listeners.push(setState);
    return () => {
      const i = listeners.indexOf(setState);
      if (i > -1) listeners.splice(i, 1);
    };
  }, []);
  return { toasts: state, toast };
}
