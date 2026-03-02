import { describe, expect, it } from 'vitest'
import {
  DEMO_REGION_PROFILE_SPECS,
  createDemoRegionDataSource,
  type DemoRegionDataSourceMode,
  type DemoRegionSampleProfile,
} from './DemoService'
import type { Region } from './components'

interface ProfileSnapshot {
  sidos: Region[]
  sigungusBySidoCode: Record<string, Region[]>
  eupmyeondongsBySigunguCode: Record<string, Region[]>
}

async function resolveRegions(maybeRegions: Region[] | Promise<Region[]>): Promise<Region[]> {
  return Promise.resolve(maybeRegions)
}

async function snapshotProfile(
  profile: DemoRegionSampleProfile,
  mode: DemoRegionDataSourceMode = 'sync',
): Promise<ProfileSnapshot> {
  const dataSource = createDemoRegionDataSource(profile, { mode })
  const sidos = await resolveRegions(dataSource.findAllSidos())
  const sigungusBySidoCode: Record<string, Region[]> = {}
  const eupmyeondongsBySigunguCode: Record<string, Region[]> = {}

  for (const sido of sidos) {
    const sigungus = await resolveRegions(dataSource.findAllSigungus(sido.code))
    sigungusBySidoCode[sido.code] = sigungus

    for (const sigungu of sigungus) {
      eupmyeondongsBySigunguCode[sigungu.code] =
        await resolveRegions(dataSource.findAllEupmyeondongs(sigungu.code))
    }
  }

  return { sidos, sigungusBySidoCode, eupmyeondongsBySigunguCode }
}

describe('DemoService deterministic profile generator', () => {
  it('small/medium/large 프로파일의 규모 규격을 일관되게 제공한다', async () => {
    ;(['small', 'medium', 'large'] as const).forEach((profile) => {
      const spec = DEMO_REGION_PROFILE_SPECS[profile]
      expect(spec.sidoCount).toBeGreaterThan(0)
    })

    for (const profile of ['small', 'medium', 'large'] as const) {
      const spec = DEMO_REGION_PROFILE_SPECS[profile]
      const snapshot = await snapshotProfile(profile)

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
    }
  })

  it('동일 프로파일은 항상 동일한 데이터셋을 결정적으로 반환한다', async () => {
    const first = await snapshotProfile('medium')
    const second = await snapshotProfile('medium')

    expect(second).toEqual(first)
  })

  it('생성된 region.code는 전역 유일하며 부모-자식 계층 규칙을 유지한다', async () => {
    const snapshot = await snapshotProfile('large')
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

  it('조회 함수는 매 호출마다 새로운 배열을 반환해 외부 변이 영향을 차단한다', async () => {
    const dataSource = createDemoRegionDataSource('small')
    const initialSidos = await resolveRegions(dataSource.findAllSidos())

    initialSidos.pop()

    expect(await resolveRegions(dataSource.findAllSidos())).toHaveLength(
      DEMO_REGION_PROFILE_SPECS.small.sidoCount,
    )
  })

  it('sync/async 데이터소스 모드는 동일한 구조를 반환한다', async () => {
    const syncSnapshot = await snapshotProfile('medium', 'sync')
    const asyncSnapshot = await snapshotProfile('medium', 'async')

    expect(asyncSnapshot).toEqual(syncSnapshot)
  })

  it('abort된 context가 전달되면 sync/async 모두 빈 배열을 반환한다', async () => {
    const controller = new AbortController()
    controller.abort()

    const syncDataSource = createDemoRegionDataSource('small', { mode: 'sync' })
    const asyncDataSource = createDemoRegionDataSource('small', { mode: 'async' })

    expect(await resolveRegions(syncDataSource.findAllSidos({ signal: controller.signal }))).toEqual([])
    expect(await resolveRegions(asyncDataSource.findAllSidos({ signal: controller.signal }))).toEqual([])
    expect(
      await resolveRegions(
        syncDataSource.findAllSigungus('11', { signal: controller.signal }),
      ),
    ).toEqual([])
    expect(
      await resolveRegions(
        asyncDataSource.findAllEupmyeondongs('11001', {
          signal: controller.signal,
        }),
      ),
    ).toEqual([])
  })
})
