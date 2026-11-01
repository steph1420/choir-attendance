import { countMarks, groupChildren } from '../src/data/derive'
import { sampleChildren } from '../src/data/sample'
const kids = sampleChildren()
test('group by section keeps all children', () => { const g = groupChildren(kids, 'section'); expect(g.map(x => x.key)).toEqual(['KG A', 'KG B', 'PREP A', 'PREP B']); expect(g.flatMap(x => x.children).length).toBe(30) })
test('group A-Z by first letter', () => { const g = groupChildren(kids, 'az'); expect(g[0].key).toBe('A'); expect(g.every(x => x.children.every(c => c.name[0] === x.key))).toBe(true) })
test('late attended, excused present by default', () => {
  const e = { X001: { mark: 'P' as const }, X002: { mark: 'L' as const }, X003: { mark: 'E' as const }, X004: { mark: 'A' as const } }
  const c = countMarks(kids.slice(0, 5), e); expect(c.present).toBe(3); expect(c.unmarked).toBe(1); expect(c.total).toBe(5)
  expect(countMarks(kids.slice(0, 5), e, 'absent').present).toBe(2)
  expect(countMarks(kids.slice(0, 5), e, 'not-counted').total).toBe(4)
})
