# T-021 Shell Wireframe

## 목적
- `trigger area`, `panel host`, `selected basket` 3영역 책임을 selector 내용과 분리해 고정한다.
- `ComposableSearch`가 어떤 selector를 붙이더라도 동일 shell 레이아웃으로 동작하도록 기준 구조를 제공한다.

## 영역 책임
- `trigger area`
  - selector 목록을 노출한다.
  - 현재 active/open 상태와 selector별 선택 개수를 보여준다.
  - panel 열기/닫기 토글만 담당한다.
- `panel host`
  - 현재 active selector의 panel UI를 담는 컨테이너다.
  - panel이 닫혀 있으면 empty state를 보여준다.
  - selector 내부 로직은 렌더링하지 않고 host container만 제공한다.
- `selected basket`
  - 전체 selection을 selector 경계와 무관하게 한 곳에서 보여준다.
  - item 제거와 clear-all만 담당한다.
  - selection merge/ownership 판단은 core/controller 책임이다.

## 데스크톱 와이어프레임
```text
+--------------------+--------------------------------------+----------------------+
| Trigger Area       | Panel Host                           | Selected Basket      |
|                    |                                      |                      |
| [지역 선택]   (2)  |  Panel Title                         |  선택된 항목         |
| [키워드 선택] (1)  |  -------------------------------     |  [서울] [삭제]       |
| [커스텀 선택]  (0) |  selector package panel content      |  [React] [삭제]      |
|                    |  lives here                          |  [전체 삭제]         |
+--------------------+--------------------------------------+----------------------+
```

## 태블릿 와이어프레임
```text
+--------------------+--------------------------------------+
| Trigger Area       | Panel Host                           |
+--------------------+--------------------------------------+
| Selected Basket                                           |
+-----------------------------------------------------------+
```

## 모바일 와이어프레임
```text
+-----------------------------------------------------------+
| Trigger Area                                              |
+-----------------------------------------------------------+
| Panel Host                                                |
+-----------------------------------------------------------+
| Selected Basket                                           |
+-----------------------------------------------------------+
```

## 구조 메모
- `trigger area`와 `panel host`는 selector 정의(`id/type/driver`)만 소비한다.
- `selected basket`은 controller snapshot의 `value`만 소비한다.
- region/keyword/custom selector 고유 UI는 모두 `panel host` 내부에서만 렌더링된다.
