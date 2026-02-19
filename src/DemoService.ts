import type { Region } from './components'

const SIDOS: Region[] = [
  { displayName: '서울특별시', name: '서울특별시', code: '11' },
  { displayName: '부산광역시', name: '부산광역시', code: '26' },
]

const SIGUNGUS: Record<string, Region[]> = {
  '11': [
    { displayName: '강남구', name: '강남구', code: '11680' },
    { displayName: '송파구', name: '송파구', code: '11710' },
  ],
  '26': [{ displayName: '해운대구', name: '해운대구', code: '26350' }],
}

const EUPMYEONDONGS: Record<string, Region[]> = {
  '11680': [
    { displayName: '역삼동', name: '역삼동', code: '1168010100' },
    { displayName: '삼성동', name: '삼성동', code: '1168010500' },
  ],
  '11710': [{ displayName: '잠실동', name: '잠실동', code: '1171010100' }],
  '26350': [{ displayName: '우동', name: '우동', code: '2635010100' }],
}

export function findAllSidos(): Region[] {
  return [...SIDOS]
}

export function findAllSigungus(sidoCode: string): Region[] {
  return [...(SIGUNGUS[sidoCode] ?? [])]
}

export function findAllEupmyeondongs(sigunguCode: string): Region[] {
  return [...(EUPMYEONDONGS[sigunguCode] ?? [])]
}

