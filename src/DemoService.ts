import type {
  MaybePromise,
  Region,
  RegionDataSource,
  SelectorLoadContext,
} from './components'

export type DemoRegionSampleProfile = 'small' | 'medium' | 'large'
export type DemoRegionDataSourceMode = 'sync' | 'async'

export interface DemoRegionProfileSpec {
  description: string
  useCase: string
  sidoCount: number
  sigunguPerSido: number
  eupmyeondongPerSigungu: number
  targetScaleNote: string
}

interface DemoRegionDataset {
  sidos: Region[]
  sigungusBySidoCode: Record<string, Region[]>
  eupmyeondongsBySigunguCode: Record<string, Region[]>
}

export interface DemoRegionDataSourceOptions {
  mode?: DemoRegionDataSourceMode
}

const SIDO_CODE_POOL = [
  '11',
  '26',
  '27',
  '28',
  '29',
  '30',
  '31',
  '36',
  '41',
  '42',
  '43',
  '44',
  '45',
  '46',
  '47',
  '48',
  '50',
] as const

export const DEMO_REGION_PROFILE_SPECS: Record<
  DemoRegionSampleProfile,
  DemoRegionProfileSpec
> = {
  small: {
    description: '기본 기능 스모크 검증',
    useCase: '개발 중 빠른 로컬 확인',
    sidoCount: 2,
    sigunguPerSido: 3,
    eupmyeondongPerSigungu: 4,
    targetScaleNote: '빠른 검증용 고정 크기',
  },
  medium: {
    description: '중간 규모 상호작용 회귀 검증',
    useCase: '기능 회귀 + QA 사전 검증',
    sidoCount: 5,
    sigunguPerSido: 12,
    eupmyeondongPerSigungu: 20,
    targetScaleNote: '중간 규모 기준선',
  },
  large: {
    description: '대량 리스트 상호작용 안정성 검증',
    useCase: '릴리스 전 부하 시나리오 점검',
    sidoCount: 10,
    sigunguPerSido: 20,
    eupmyeondongPerSigungu: 30,
    targetScaleNote: '최종 목표 수량 상향 여부는 TBD',
  },
}

function resolveSidoCode(index: number): string {
  const pooledCode = SIDO_CODE_POOL[index]
  if (pooledCode) {
    return pooledCode
  }

  return String(60 + index).padStart(2, '0')
}

function createRegion(displayName: string, code: string): Region {
  return {
    displayName,
    name: displayName,
    code,
  }
}

function cloneRegions(regions: Region[]): Region[] {
  return regions.map((region) => ({ ...region }))
}

function createRegionDisplayName(
  level: 'sido' | 'sigungu' | 'eupmyeondong',
  identifiers: {
    sidoOrdinal: number
    sigunguOrdinal?: number
    eupmyeondongOrdinal?: number
  },
): string {
  const sidoPart = String(identifiers.sidoOrdinal).padStart(2, '0')

  if (level === 'sido') {
    return `샘플시도-${sidoPart}`
  }

  const sigunguPart = String(identifiers.sigunguOrdinal).padStart(2, '0')
  if (level === 'sigungu') {
    return `샘플시군구-${sidoPart}-${sigunguPart}`
  }

  const eupmyeondongPart = String(identifiers.eupmyeondongOrdinal).padStart(2, '0')
  return `샘플읍면동-${sidoPart}-${sigunguPart}-${eupmyeondongPart}`
}

function createDemoRegionDataset(spec: DemoRegionProfileSpec): DemoRegionDataset {
  const sidos: Region[] = []
  const sigungusBySidoCode: Record<string, Region[]> = {}
  const eupmyeondongsBySigunguCode: Record<string, Region[]> = {}

  for (let sidoIndex = 0; sidoIndex < spec.sidoCount; sidoIndex += 1) {
    const sidoOrdinal = sidoIndex + 1
    const sidoCode = resolveSidoCode(sidoIndex)
    const sido = createRegion(
      createRegionDisplayName('sido', { sidoOrdinal }),
      sidoCode,
    )

    sidos.push(sido)
    sigungusBySidoCode[sidoCode] = []

    for (
      let sigunguIndex = 0;
      sigunguIndex < spec.sigunguPerSido;
      sigunguIndex += 1
    ) {
      const sigunguOrdinal = sigunguIndex + 1
      const sigunguCode = `${sidoCode}${String(sigunguOrdinal).padStart(3, '0')}`
      const sigungu = createRegion(
        createRegionDisplayName('sigungu', { sidoOrdinal, sigunguOrdinal }),
        sigunguCode,
      )

      sigungusBySidoCode[sidoCode].push(sigungu)
      eupmyeondongsBySigunguCode[sigunguCode] = []

      for (
        let eupmyeondongIndex = 0;
        eupmyeondongIndex < spec.eupmyeondongPerSigungu;
        eupmyeondongIndex += 1
      ) {
        const eupmyeondongOrdinal = eupmyeondongIndex + 1
        const eupmyeondongCode = `${sigunguCode}${String(eupmyeondongOrdinal).padStart(5, '0')}`
        const eupmyeondong = createRegion(
          createRegionDisplayName('eupmyeondong', {
            sidoOrdinal,
            sigunguOrdinal,
            eupmyeondongOrdinal,
          }),
          eupmyeondongCode,
        )

        eupmyeondongsBySigunguCode[sigunguCode].push(eupmyeondong)
      }
    }
  }

  return {
    sidos,
    sigungusBySidoCode,
    eupmyeondongsBySigunguCode,
  }
}

function createDataSourceFromDataset(dataset: DemoRegionDataset): RegionDataSource {
  const mode = 'sync'

  return createDataSourceFromDatasetByMode(dataset, mode)
}

function createDataSourceFromDatasetByMode(
  dataset: DemoRegionDataset,
  mode: DemoRegionDataSourceMode,
): RegionDataSource {
  const resolveRegions = (
    regions: Region[],
    context?: SelectorLoadContext,
  ): MaybePromise<Region[]> => {
    if (context?.signal.aborted) {
      return mode === 'async' ? Promise.resolve([]) : []
    }

    if (mode === 'sync') {
      return cloneRegions(regions)
    }

    return Promise.resolve().then(() =>
      context?.signal.aborted ? [] : cloneRegions(regions),
    )
  }

  return {
    findAllSidos: (context?: SelectorLoadContext) =>
      resolveRegions(dataset.sidos, context),
    findAllSigungus: (sidoCode: string, context?: SelectorLoadContext) =>
      resolveRegions(dataset.sigungusBySidoCode[sidoCode] ?? [], context),
    findAllEupmyeondongs: (
      sigunguCode: string,
      context?: SelectorLoadContext,
    ) => resolveRegions(dataset.eupmyeondongsBySigunguCode[sigunguCode] ?? [], context),
  }
}

const DEMO_REGION_DATASETS: Record<DemoRegionSampleProfile, DemoRegionDataset> = {
  small: createDemoRegionDataset(DEMO_REGION_PROFILE_SPECS.small),
  medium: createDemoRegionDataset(DEMO_REGION_PROFILE_SPECS.medium),
  large: createDemoRegionDataset(DEMO_REGION_PROFILE_SPECS.large),
}

const DEMO_REGION_SYNC_DATA_SOURCES: Record<
  DemoRegionSampleProfile,
  RegionDataSource
> = {
  small: createDataSourceFromDataset(DEMO_REGION_DATASETS.small),
  medium: createDataSourceFromDataset(DEMO_REGION_DATASETS.medium),
  large: createDataSourceFromDataset(DEMO_REGION_DATASETS.large),
}

export function createDemoRegionDataSource(
  profile: DemoRegionSampleProfile,
  options: DemoRegionDataSourceOptions = {},
): RegionDataSource {
  const mode = options.mode ?? 'sync'

  if (mode === 'sync') {
    return DEMO_REGION_SYNC_DATA_SOURCES[profile]
  }

  return createDataSourceFromDatasetByMode(DEMO_REGION_DATASETS[profile], mode)
}

export function findAllSidos(
  context?: SelectorLoadContext,
): MaybePromise<Region[]> {
  return createDemoRegionDataSource('small').findAllSidos(context)
}

export function findAllSigungus(
  sidoCode: string,
  context?: SelectorLoadContext,
): MaybePromise<Region[]> {
  return createDemoRegionDataSource('small').findAllSigungus(sidoCode, context)
}

export function findAllEupmyeondongs(
  sigunguCode: string,
  context?: SelectorLoadContext,
): MaybePromise<Region[]> {
  return createDemoRegionDataSource('small').findAllEupmyeondongs(
    sigunguCode,
    context,
  )
}

