import { popupSide } from '../src/ui/placement'
test('opens below when room', () => expect(popupSide(100, 148, 200, 844)).toBe('below'))
test('flips above near the bottom (BUG-2, Q27=B)', () => expect(popupSide(760, 808, 200, 844)).toBe('above'))
test('stays below if neither fits but below is larger', () => expect(popupSide(150, 198, 700, 844)).toBe('below'))
