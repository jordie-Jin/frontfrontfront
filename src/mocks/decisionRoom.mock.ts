// 의사결정룸 화면용 목 데이터입니다.
import { Bulletin, QaPost } from '../types/decisionRoom';

const bulletinBodies = [
  [
    '모든 협력사는 Q2 마감 이전에 보안 프로토콜을 갱신해야 합니다.',
    '새로운 규정은 다중 인증과 엔드-투-엔드 암호화를 포함합니다.',
    '승인된 네트워크 채널 외의 전송은 자동 차단됩니다.',
    '기존 VPN 터널은 6월 말에 순차적으로 폐기됩니다.',
    '자세한 변경 사항은 보안 포털에서 확인하세요.',
    '문서 갱신 이후 48시간 내 감사 로그 제출이 필요합니다.',
  ],
  [
    '동남아 공급망 확장 프로젝트가 2차 구간에 진입했습니다.',
    'SG-07 및 HCM-11 노드가 정식 가동되며 지연 시간이 35% 감소합니다.',
    '파트너는 신규 라우팅 테이블을 배포해야 합니다.',
    '테스트 윈도우는 5월 20일부터 5월 25일까지입니다.',
    '최소 1회 이상 성능 검증 결과를 제출해야 합니다.',
  ],
  [
    'SENTINEL-OWL v3.4 패치가 배포되었습니다.',
    '새로운 위험 예측 모델이 공지/결정 스코어에 반영됩니다.',
    '대시보드에 신뢰도 지표가 추가되었습니다.',
    'NLP 요약 품질이 향상되어 Decision Room 응답 속도가 개선됩니다.',
    '업데이트 이후 24시간 내 신호 이상 여부를 보고하세요.',
  ],
];

export const decisionRoomMockOptions = {
  emptyBulletins: false,
  emptyQa: false,
};

const activeBulletins: Bulletin[] = [
  {
    id: 'bulletin-urgent-q2',
    title: '협력사 보안 프로토콜 갱신 지침 (Q2 마감)',
    summary: 'Tier-1 파트너는 새로운 보안 규정에 맞춰 계정 및 네트워크 구성을 업데이트해야 합니다.',
    body: bulletinBodies[0].join('\n'),
    tag: 'URGENT',
    issuedBy: 'Compliance Dept.',
    date: '2025-05-12',
    links: [
      { label: '보안 포털 접근 요청', url: '#' },
      { label: '감사 로그 업로드', url: '#' },
    ],
  },
  {
    id: 'bulletin-update-sea',
    title: '동남아 공급망 확장: SEA Corridors',
    summary: 'Singapore 및 Ho Chi Minh 신규 노드가 활성화되었습니다. 라우팅 전환을 준비해주세요.',
    body: bulletinBodies[1].join('\n'),
    tag: 'UPDATE',
    issuedBy: 'Infrastructure Node',
    date: '2025-05-10',
    links: [{ label: '라우팅 가이드 다운로드', url: '#' }],
  },
  {
    id: 'bulletin-advisory-owl',
    title: 'SENTINEL-OWL v3.4 패치 노트',
    summary: '위험 예측과 요약 알고리즘이 업그레이드되었습니다. 점검 내용을 확인하세요.',
    body: bulletinBodies[2].join('\n'),
    tag: 'ADVISORY',
    issuedBy: 'AI Development Lab',
    date: '2025-05-08',
    links: [
      { label: '패치 로그', url: '#' },
      { label: '운영 체크리스트', url: '#' },
    ],
  },
  {
    id: 'bulletin-update-audit',
    title: '글로벌 파트너 감사 리포트 제출 안내',
    summary: '5월 말까지 모든 지역 파트너의 리스크 리포트를 수집합니다.',
    body: [
      '각 지역별 리스크 리포트는 표준 템플릿에 따라 제출해야 합니다.',
      'Compliance Dept.에서 제공한 범주 코드를 반드시 사용하세요.',
      '제출된 리포트는 72시간 내 검수됩니다.',
      '검수 완료 후 고위험 항목에 대한 후속 지시가 전달됩니다.',
      '연체 시 통합 점수에 불이익이 발생할 수 있습니다.',
    ].join('\n'),
    tag: 'UPDATE',
    issuedBy: 'Compliance Dept.',
    date: '2025-05-06',
  },
  {
    id: 'bulletin-advisory-scan',
    title: '공급망 취약점 스캔 일정 공지',
    summary: '6월 첫째 주, 전 파트너 대상 자동 스캔이 진행됩니다.',
    body: [
      '자동 스캔은 파트너 인프라에 대한 비침투 방식으로 진행됩니다.',
      '예상 소요 시간은 파트너당 15~20분입니다.',
      '스캔 결과는 Decision Room 요약에 반영됩니다.',
      '필요 시 추가 점검 요청이 전달될 수 있습니다.',
    ].join('\n'),
    tag: 'ADVISORY',
    issuedBy: 'Network Security Ops',
    date: '2025-05-05',
  },
];

const archivedBulletins: Bulletin[] = [
  {
    id: 'bulletin-archive-1',
    title: '분기별 파트너 온보딩 정책 변경',
    summary: '온보딩 절차가 간소화되며 검증 단계가 재정렬됩니다.',
    body: [
      '온보딩 정책 변경 사항은 2025년 1분기 기준으로 적용됩니다.',
      '검증 단계는 사전 서류 검토 후 현장 확인으로 순서를 변경합니다.',
      '리드 타임 단축을 위해 자동화된 리스크 평가를 적용합니다.',
      '기존 파트너는 1회 면제 정책이 제공됩니다.',
    ].join('\n'),
    tag: 'UPDATE',
    issuedBy: 'Partner Operations',
    date: '2025-02-14',
  },
];

export function getMockBulletins(mode: 'active' | 'archive'): Bulletin[] {
  if (decisionRoomMockOptions.emptyBulletins) {
    return [];
  }
  if (mode === 'archive') {
    return archivedBulletins;
  }
  return activeBulletins;
}

export function getMockQaPosts(): QaPost[] {
  if (decisionRoomMockOptions.emptyQa) {
    return [];
  }
  return [
    {
      id: 'qa-001',
      title: 'SEA 노드 전환 시기와 다운타임 기준은?',
      body: 'SG-07 노드로 전환 시 예상되는 다운타임 허용 범위를 확인하고 싶습니다.',
      author: 'Min Seo',
      createdAt: '2025-05-11 09:24',
      updatedAt: '2025-05-12 10:03',
      status: 'answered',
      tags: ['Infrastructure', 'SEA Corridors'],
      replies: [
        {
          id: 'qa-001-r1',
          author: 'Infrastructure Node',
          createdAt: '2025-05-12 10:03',
          body: '전환은 20분 이내를 목표로 하며, 다운타임 허용 범위는 최대 30분입니다. 유지보수 창 내 단계별 체크리스트를 참고해주세요.',
        },
      ],
    },
    {
      id: 'qa-002',
      title: '보안 프로토콜 갱신 시 MFA 장비 인증 범위',
      body: '새 규정에서 하드웨어 토큰과 모바일 토큰 모두 승인되나요?',
      author: 'Jina Park',
      createdAt: '2025-05-11 14:50',
      status: 'pending',
      tags: ['Compliance'],
      replies: [],
    },
    {
      id: 'qa-003',
      title: 'SENTINEL-OWL v3.4 리스크 점수 반영 시점',
      body: '기존 파트너 점수는 언제부터 새로운 모델로 업데이트 되나요?',
      author: 'Ethan Kim',
      createdAt: '2025-05-10 18:12',
      updatedAt: '2025-05-11 08:30',
      status: 'answered',
      tags: ['AI Lab', 'Risk'],
      replies: [
        {
          id: 'qa-003-r1',
          author: 'AI Development Lab',
          createdAt: '2025-05-11 08:30',
          body: '5월 12일 배치 작업부터 신규 모델이 적용됩니다. 기존 점수는 48시간 내 재계산됩니다.',
        },
      ],
    },
    {
      id: 'qa-004',
      title: '감사 리포트 제출 양식과 언어 기준',
      body: '영어 외 다른 언어 제출이 허용되는지 확인 부탁드립니다.',
      author: 'Sofia Lin',
      createdAt: '2025-05-09 11:02',
      updatedAt: '2025-05-09 16:20',
      status: 'answered',
      tags: ['Compliance', 'Audit'],
      replies: [
        {
          id: 'qa-004-r1',
          author: 'Compliance Dept.',
          createdAt: '2025-05-09 16:20',
          body: '기본 제출 언어는 영어이며, 부득이한 경우 한국어/일본어 병기 형태로 제출 가능합니다.',
        },
        {
          id: 'qa-004-r2',
          author: 'Compliance Dept.',
          createdAt: '2025-05-09 16:45',
          body: '추가 양식은 템플릿 탭에서 확인할 수 있습니다. 필요한 경우 별도 요청해주세요.',
        },
      ],
    },
    {
      id: 'qa-005',
      title: '취약점 스캔 일정 변경 요청 가능 여부',
      body: '6월 1주차에 운영 리소스가 부족합니다. 일정 조정이 가능한가요?',
      author: 'Luis Ortega',
      createdAt: '2025-05-08 13:18',
      status: 'pending',
      tags: ['Security Ops'],
      replies: [],
    },
  ];
}
