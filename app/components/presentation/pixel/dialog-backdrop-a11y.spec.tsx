import { cleanup, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  DialogBackdropA11y,
  useHideBehindDialog,
} from './dialog-backdrop-a11y';

// O testid carrega o valor de importantForAccessibility (o tsconfig não tem lib "dom").
vi.mock('react-native', () => ({
  Platform: { OS: 'android' },
  View: ({
    importantForAccessibility,
    children,
  }: {
    importantForAccessibility: string;
    children: ReactNode;
  }) => <div data-testid={`app-${importantForAccessibility}`}>{children}</div>,
}));

function Fake({ visible }: { visible: boolean }) {
  useHideBehindDialog(visible);
  return null;
}

function Tree({ a, b }: { a?: boolean; b?: boolean }) {
  return (
    <DialogBackdropA11y>
      {a !== undefined && <Fake visible={a} />}
      {b !== undefined && <Fake visible={b} />}
    </DialogBackdropA11y>
  );
}

describe('DialogBackdropA11y', () => {
  afterEach(cleanup);

  it('esconde o app só enquanto algum diálogo está visível', () => {
    const { getByTestId, rerender } = render(<Tree a={false} b={false} />);
    getByTestId('app-auto');
    rerender(<Tree a b />);
    getByTestId('app-no-hide-descendants');
    rerender(<Tree a={false} b />);
    getByTestId('app-no-hide-descendants');
    rerender(<Tree a={false} b={false} />);
    expect(getByTestId('app-auto')).toBeTruthy();
  });

  it('diálogo desmontado ainda aberto não deixa o app escondido', () => {
    const { getByTestId, rerender } = render(<Tree a />);
    getByTestId('app-no-hide-descendants');
    rerender(<Tree />);
    expect(getByTestId('app-auto')).toBeTruthy();
  });
});
