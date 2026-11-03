import type { Child } from '../data/model'
import type { Costume, Note, Prop } from './kinds'
const SZ = ['XS', 'S', 'M', 'L'], ST = ['Stitched', 'Fitting', 'Measured', 'Not measured', 'At tailor', 'Ready'] as const
export const seedCostumes = (kids: Child[]): Costume[] => kids.slice(0, 12).map((k, i) => ({ id: `c${i}`, memberId: k.id, who: k.name, item: 'Sunflower dress', size: SZ[i % 4], status: ST[i % 6] }))
export const seedProps = (): Prop[] => [
  { id: 'p1', name: 'Paper sunflower', qty: 8, how: 'Make', owner: 'Parents of KG A', parents: true, due: '2026-11-12', status: 'Asked' },
  { id: 'p2', name: 'Watering can', qty: 1, how: 'Bring', owner: 'C-child 03 (parent)', parents: true, status: 'Received' },
  { id: 'p3', name: 'Backdrop sun', qty: 1, how: 'Make', owner: 'Teacher-S', parents: false, due: '2026-12-01', status: 'In progress' },
  { id: 'p4', name: 'Garden fence', qty: 1, how: 'Bring', owner: 'G-child 06 (parent)', parents: true, due: '2026-11-10', status: 'Not sent' },
  { id: 'p5', name: 'Rain sticks', qty: 4, how: 'Borrow', owner: 'School store', parents: false, status: 'Ready' }]
export const seedNotes = (): Note[] => [
  { id: 'n1', title: 'Stage entry order', text: 'Group A enters left, B right after the second chorus.', tags: ['stage'], pinned: true, at: '2026-11-03T09:00:00Z' },
  { id: 'n2', title: 'Show-day bag', text: '', items: [{ t: 'Safety pins', done: true }, { t: 'Speaker', done: true }, { t: 'Spare socks', done: false }, { t: 'Water', done: false }], tags: ['stage'], at: '2026-11-03T08:00:00Z' },
  { id: 'n3', title: 'Costumes', text: 'Tailor-D: S size short by 2.', tags: ['costumes'], at: '2026-11-03T06:12:00Z', screen: 'Costumes' },
  { id: 'n4', title: 'Song ideas', text: 'Rain song for item 3? Ask music teacher.', tags: [], at: '2026-11-02T10:00:00Z' }]
