// CODE-6: all limits/thresholds/timings live here. Developer options read this.
export const CONFIG = {
  storageKey: 'choir-attendance/v1',
  schemaVersion: 1, // CODE-5
  lowAttendancePct: 75, // A-02 Q10 (default, Settings)
  excusedCountsAs: 'present' as 'present' | 'absent' | 'not-counted', // A-02 Q11
  lateCountsAsAttended: true, // A-02 round 3 (Late = attended)
  syncRetryMs: 5000,
  syncBatchMax: 50,
  stars: 5, // A-02 Q17 proficiency
  excusedReasons: ['Sick', 'On leave', 'School duty', 'Other'],
  az: { idleW: 42, letterMinPx: 11, leftSide: false, showHud: true }, // from LFPS-SOW v0.45.0
} as const
