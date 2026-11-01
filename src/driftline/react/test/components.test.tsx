import { render, screen, fireEvent } from '@testing-library/react';
import { useState } from 'react';
import { Segmented, Toggle, Chip, StatusDot, Dock, ThemeProvider, Sheet } from '../src';

beforeAll(() => { (window as any).matchMedia = (q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} }); });

function Seg() { const [v, setV] = useState<'a' | 'b'>('a'); return <Segmented<"a" | "b"> label="Pick" value={v} onChange={setV} options={[{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }]} />; }

describe('components', () => {
  it('segmented is a radiogroup and moves selection', () => {
    render(<Seg />);
    expect(screen.getByRole('radiogroup', { name: 'Pick' })).toBeTruthy();
    fireEvent.click(screen.getByRole('radio', { name: 'B' }));
    expect(screen.getByRole('radio', { name: 'B' }).getAttribute('aria-checked')).toBe('true');
  });
  it('toggle is a named switch', () => {
    const fn = vi.fn(); render(<Toggle label="Haptics" checked={false} onChange={fn} />);
    fireEvent.click(screen.getByRole('switch', { name: 'Haptics' })); expect(fn).toHaveBeenCalledWith(true);
  });
  it('colour is never the only signal: chips carry text, dots carry a name', () => {
    render(<><Chip tone="danger">Need</Chip><StatusDot state="offline" /></>);
    expect(screen.getByText('Need')).toBeTruthy(); expect(screen.getByRole('status', { name: 'Offline' })).toBeTruthy();
  });
  it('dock marks the current page and names badges', () => {
    render(<Dock value="a" onChange={() => {}} tabs={[{ id: 'a', label: 'Today', icon: '•' }, { id: 'b', label: 'Plan', icon: '•', badge: 3 }]} />);
    expect(screen.getByRole('button', { name: /Today/ }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByLabelText('3 pending')).toBeTruthy();
  });
  it('sheet is a modal dialog that closes on Escape', () => {
    const close = vi.fn(); render(<Sheet open title="Edit" onClose={close}>x</Sheet>);
    expect(screen.getByRole('dialog', { name: 'Edit' })).toBeTruthy();
    fireEvent.keyDown(window, { key: 'Escape' }); expect(close).toHaveBeenCalled();
  });
  it('theme provider writes data-theme and data-density', () => {
    render(<ThemeProvider initial={{ family: 'retro-glass', side: 'day', density: 'stage' }}><span /></ThemeProvider>);
    expect(document.documentElement.dataset.theme).toBe('retro-glass-day'); expect(document.documentElement.dataset.density).toBe('stage');
  });
});
