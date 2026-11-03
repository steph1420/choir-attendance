# Register: suggestion circles motion (PROPOSAL, numbers not locked by Steve)

Trigger: the remarks box in an opened row gets focus. Circles float just above that child's name row; other rows dim to ~30%.

- Order: pop in LEFT to RIGHT, one circle at a time.
- Stagger: ~40 ms between circles (5 circles ≈ 160 ms until the last one starts).
- Scale: 0.6 → 1.0 with a spring and slight overshoot (peak ≈ 1.06), e.g. framer-motion `{ type: 'spring', stiffness: 520, damping: 22, mass: 0.7 }`, settles in ~250 ms.
- Fade: opacity 0 → 1 over ~120 ms, starting with each circle's scale.
- Rise: optional 6–8 px upward drift as it appears (follows the arc offsets).
- Tap: the chosen circle scales to ~1.1 and shows ✓, others fade to 55%; the label is inserted into the remarks as a coloured token.
- Dismiss (blur or after insert): reverse order (right to left), 25 ms stagger, scale to 0.8 + fade out over ~100 ms.
- Reduced motion: no scale/spring, a plain 120 ms fade for all circles together.

Frame `R7-register-phone-bubbles-popin.png` shows mid-animation (left circles full size, right ones still small/faded).
