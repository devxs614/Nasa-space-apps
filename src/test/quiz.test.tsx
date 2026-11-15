import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import i18n from '../i18n';
import { Quiz } from '../components/quiz/Quiz';
import { MACHINES_BY_ID } from '../data/machines';
import { useAppStore } from '../state/useAppStore';
import { resources } from '../i18n';

const q = (resources.es.quiz as unknown as Record<string, Record<string, Record<string, string>>>)
  .surveyor!;

beforeEach(async () => {
  await i18n.changeLanguage('es');
  useAppStore.getState().resetProgress();
  useAppStore.setState({ locale: 'es', classroomMode: false });
});

function answerAll(correct: boolean) {
  for (const k of ['q1', 'q2', 'q3']) {
    const text = correct ? q[k]!.a! : q[k]!.b!;
    fireEvent.click(screen.getByRole('radio', { name: text }));
    fireEvent.click(screen.getByRole('button', { name: 'Comprobar' }));
    const next = screen.queryByRole('button', { name: /Siguiente pregunta|Ver mi resultado/ });
    if (next) fireEvent.click(next);
  }
}

describe('Quiz', () => {
  it('la opción correcta muestra "Correcto" y la explicación', () => {
    render(<Quiz machine={MACHINES_BY_ID.surveyor} seed={1} />);
    fireEvent.click(screen.getByRole('button', { name: 'Empezar el quiz' }));
    fireEvent.click(screen.getByRole('radio', { name: q.q1!.a! }));
    fireEvent.click(screen.getByRole('button', { name: 'Comprobar' }));
    expect(screen.getAllByText(/Correcto/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(q.q1!.explain!).length).toBeGreaterThan(0);
  });
  it('al terminar guarda el mejor resultado con saveQuiz', () => {
    render(<Quiz machine={MACHINES_BY_ID.surveyor} seed={2} />);
    fireEvent.click(screen.getByRole('button', { name: 'Empezar el quiz' }));
    answerAll(true);
    expect(useAppStore.getState().progress.surveyor.bestQuiz).toBe(3);
  });
  it('las opciones cambian de orden con semillas distintas', () => {
    const order = (seed: number) => {
      const { unmount } = render(<Quiz machine={MACHINES_BY_ID.surveyor} seed={seed} />);
      fireEvent.click(screen.getByRole('button', { name: 'Empezar el quiz' }));
      const labels = screen
        .getAllByRole('radio')
        .map(
          (r) => r.getAttribute('value') ?? (r as HTMLInputElement).labels?.[0]?.textContent ?? '',
        );
      unmount();
      return labels.join('|');
    };
    const seen = new Set([1, 2, 3, 4, 5, 6].map(order));
    expect(seen.size).toBeGreaterThan(1);
  });
});
