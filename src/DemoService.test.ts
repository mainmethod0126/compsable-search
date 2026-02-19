import { describe, expect, it } from 'vitest'
import {
  DEMO_REGION_PROFILE_SPECS,
  createDemoRegionDataSource,
  type DemoRegionSampleProfile,
} from './DemoService'
import type { Region } from './components'

interface ProfileSnapshot {
  sidos: Region[]
  sigungusBySidoCode: Record<string, Region[]>
  eupmyeondongsBySigunguCode: Record<string, Region[]>
}

function snapshotProfile(profile: DemoRegionSampleProfile): ProfileSnapshot {
  const dataSource = createDemoRegionDataSource(profile)
  const sidos = dataSource.findAllSidos()
  const sigungusBySidoCode: Record<string, Region[]> = {}
  const eupmyeondongsBySigunguCode: Record<string, Region[]> = {}

  sidos.forEach((sido) => {
    const sigungus = dataSource.findAllSigungus(sido.code)
    sigungusBySidoCode[sido.code] = sigungus

    sigungus.forEach((sigungu) => {
      eupmyeondongsBySigunguCode[sigungu.code] =
        dataSource.findAllEupmyeondongs(sigungu.code)
    })
  })

  return { sidos, sigungusBySidoCode, eupmyeondongsBySigunguCode }
}

describe('DemoService deterministic profile generator', () => {
  it('small/medium/large 프로파일의 규모 규격을 일관되게 제공한다', () => {
    ;(['small', 'medium', 'large'] as const).forEach((profile) => {
      const spec = DEMO_REGION_PROFILE_SPECS[profile]
      const snapshot = snapshotProfile(profile)

      expect(snapshot.sidos).toHaveLength(spec.sidoCount)

      snapshot.sidos.forEach((sido) => {
        const sigungus = snapshot.sigungusBySidoCode[sido.code]
        expect(sigungus).toHaveLength(spec.sigunguPerSido)

        sigungus.forEach((sigungu) => {
          expect(snapshot.eupmyeondongsBySigunguCode[sigungu.code]).toHaveLength(
            spec.eupmyeondongPerSigungu,
          )
        })
      })
    })
  })

  it('동일 프로파일은 항상 동일한 데이터셋을 결정적으로 반환한다', () => {
    const first = snapshotProfile('medium')
    const second = snapshotProfile('medium')

    expect(second).toEqual(first)
  })

  it('생성된 region.code는 전역 유일하며 부모-자식 계층 규칙을 유지한다', () => {
    const snapshot = snapshotProfile('large')
    const usedCodes = new Set<string>()

    const assertUniqueCode = (code: string) => {
      expect(usedCodes.has(code)).toBe(false)
      usedCodes.add(code)
    }

    snapshot.sidos.forEach((sido) => {
      expect(sido.code).toMatch(/^\d{2}$/)
      assertUniqueCode(sido.code)

      const sigungus = snapshot.sigungusBySidoCode[sido.code]
      sigungus.forEach((sigungu) => {
        expect(sigungu.code).toMatch(/^\d{5}$/)
        expect(sigungu.code.startsWith(sido.code)).toBe(true)
        assertUniqueCode(sigungu.code)

        const eupmyeondongs = snapshot.eupmyeondongsBySigunguCode[sigungu.code]
        eupmyeondongs.forEach((eupmyeondong) => {
          expect(eupmyeondong.code).toMatch(/^\d{10}$/)
          expect(eupmyeondong.code.startsWith(sigungu.code)).toBe(true)
          assertUniqueCode(eupmyeondong.code)
        })
      })
    })
  })

  it('조회 함수는 매 호출마다 새로운 배열을 반환해 외부 변이 영향을 차단한다', () => {
    const dataSource = createDemoRegionDataSource('small')
    const initialSidos = dataSource.findAllSidos()

    initialSidos.pop()

    expect(dataSource.findAllSidos()).toHaveLength(
      DEMO_REGION_PROFILE_SPECS.small.sidoCount,
    )
  })
})
