import { render, screen, fireEvent, act } from '@testing-library/react';
import { HoldToConfirm, setHapticLevel } from '../src';
import { HOLD } from '../../tokens/dist/tokens';

beforeAll(() => { (window as any).matchMedia = (q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} }); });
beforeEach(() => vi.useFakeTimers());
afterEach(() => { vi.useRealTimers(); delete (navigator as any).vibrate; setHapticLevel('normal'); });

const btn = () => screen.getByRole('button');

describe('HoldToConfirm', () => {
  it('announces how to use it', () => {
    render(<HoldToConfirm label="Hold to clear" onConfirm={() => {}} />);
    expect(btn().getAttribute('aria-label')).toBe(`Hold to clear. Press and hold for ${(HOLD.durationMs / 1000).toFixed(1).replace(/\.0$/, '')} seconds`);
  });
  it('confirms after a full hold, with start + confirm haptics', () => {
    const v = vi.fn(() => true); (navigator as any).vibrate = v;
    const ok = vi.fn(); render(<HoldToConfirm label="Hold" onConfirm={ok} />);
    fireEvent.pointerDown(btn(), { button: 0, pointerId: 1 });
    expect(v).toHaveBeenLastCalledWith(8);
    act(() => { vi.advanceTimersByTime(HOLD.durationMs); });
    expect(ok).toHaveBeenCalledTimes(1);
    expect(v).toHaveBeenLastCalledWith([12, 40, 18]);
    expect(btn().dataset.state).toBe('done');
  });
  it('early release cancels and returns to idle', () => {
    const ok = vi.fn(); render(<HoldToConfirm label="Hold" onConfirm={ok} />);
    fireEvent.pointerDown(btn(), { button: 0, pointerId: 1 });
    act(() => { vi.advanceTimersByTime(HOLD.durationMs - 100); });
    fireEvent.pointerUp(btn(), { pointerId: 1 });
    act(() => { vi.advanceTimersByTime(2000); });
    expect(ok).not.toHaveBeenCalled(); expect(btn().dataset.state).toBe('idle');
  });
  it('keyboard: holding Space confirms, early keyup cancels', () => {
    const ok = vi.fn(); render(<HoldToConfirm label="Hold" onConfirm={ok} />);
    fireEvent.keyDown(btn(), { key: ' ' }); act(() => { vi.advanceTimersByTime(200); }); fireEvent.keyUp(btn(), { key: ' ' });
    expect(ok).not.toHaveBeenCalled();
    fireEvent.keyDown(btn(), { key: 'Enter' }); act(() => { vi.advanceTimersByTime(HOLD.durationMs); });
    expect(ok).toHaveBeenCalledTimes(1);
  });
  it('respects haptic level Off and the disabled state', () => {
    const v = vi.fn(() => true); (navigator as any).vibrate = v; setHapticLevel('off');
    const ok = vi.fn(); const { rerender } = render(<HoldToConfirm label="Hold" onConfirm={ok} />);
    fireEvent.pointerDown(btn(), { button: 0, pointerId: 1 }); act(() => { vi.advanceTimersByTime(HOLD.durationMs); });
    expect(v).not.toHaveBeenCalled(); expect(ok).toHaveBeenCalledTimes(1);
    rerender(<HoldToConfirm label="Hold2" onConfirm={ok} disabled />);
    act(() => { vi.advanceTimersByTime(2000); });
    fireEvent.pointerDown(btn(), { button: 0, pointerId: 1 }); act(() => { vi.advanceTimersByTime(HOLD.durationMs); });
    expect(ok).toHaveBeenCalledTimes(1);
  });
  it('fires once even if held long, and ignores re-press while done', () => {
    const ok = vi.fn(); render(<HoldToConfirm label="Hold" onConfirm={ok} />);
    fireEvent.pointerDown(btn(), { button: 0, pointerId: 1 }); act(() => { vi.advanceTimersByTime(HOLD.durationMs * 3); });
    fireEvent.pointerDown(btn(), { button: 0, pointerId: 1 }); act(() => { vi.advanceTimersByTime(HOLD.durationMs); });
    expect(ok).toHaveBeenCalledTimes(1);
  });
});
