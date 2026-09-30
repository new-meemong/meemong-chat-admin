const labels: Record<string, string> = {
  chat_list: '채팅 목록', push: '푸시',
  model_home_consultation: '모델 메인 상담 영역', designer_home_consultation: '디자이너 메인 상담 영역',
  consultation_list: '헤어컨설팅 목록', my_activity: '내 활동', model_profile_consultation: '모델 프로필 상담글',
  map: '지도로 전환', list: '목록으로 전환', map_result: '지도 결과', search_result: '검색 결과',
  post: '게시글', answer_written: '답변 작성 완료', direct_chat: '추가 상담하기', author_chat: '글쓴이와 채팅하기',
  "Flutter/Firebase + 웹 + 제품": "경로·첫 발송·답장·날짜 기준 확정, 공통 경로 문맥 계약",
  "Flutter, 헤어컨설팅 웹, 구인구직 웹": "경로 전달 및 Firestore 기록",
  "Flutter/Firebase": "실제 발송/답장 facts와 집계, Rules·인덱스",
  "채팅 관리자 웹": "일/주/월 경로 표와 목록 연결",
  "Flutter/Firebase + 분석": "배포 후 수집 품질 확인, 과거 보완 범위 판단",
  "MODEL_ANNOUNCEMENT_DETAIL_APPLY_CHAT": "모델 모집 공고 상세 지원/문의",
  "QUICK_MATCHING_GENERAL_DETAIL_CHAT": "일반 빠른매칭 상세 문의",
  "QUICK_MATCHING_PREMIUM_DETAIL_CHAT": "프리미엄 빠른매칭 상세 문의",
  "EXPERIENCE_GROUP_DETAIL_CHAT": "체험단",
  "HAIR_CONSULTATION_POST_COMMENT_DIRECT_CHAT": "디자이너가 컨설팅 답변 작성 후 글쓴이와 채팅",
  "HAIR_CONSULTATION_POST_COMMENT_DESIGNER_PROFILE_MENU_INQUIRY": "헤어컨설팅 댓글 → 디자이너 프로필 → 메뉴 문의",
  "HAIR_CONSULTATION_RESPONSE_DETAIL_DIRECT_CHAT": "모델이 답변 상세에서 추가 상담하기",
  "HAIR_CONSULTATION_RESPONSE_DETAIL_DESIGNER_PROFILE_MENU_INQUIRY": "헤어컨설팅 답변 상세 → 프로필 → 메뉴 문의",
  "REVIEW_SPECIAL_RESERVATION_ACCEPT_CHAT": "리뷰특가 예약 수락으로 방 생성",
  "JOB_POSTING_DETAIL_APPLY_CHAT": "구인 공고 지원 채팅",
  "RESUME_DETAIL_OFFER_CHAT": "이력서 제안 채팅",
  "MODEL_PROFILE_DIRECT_CHAT": "모델 프로필 직접 채팅",
  "DESIGNER_PROFILE_MENU_INQUIRY": "디자이너 프로필 메뉴 문의",
  "QUICK_MATCHING_GENERAL_DESIGNER_PROFILE_MENU_INQUIRY": "일반 빠른매칭 → 디자이너 프로필 → 메뉴 문의",
  "QUICK_MATCHING_PREMIUM_DESIGNER_PROFILE_MENU_INQUIRY": "프리미엄 빠른매칭 → 디자이너 프로필 → 메뉴 문의",
  "RECENT_ACCESS_RECOMMENDED_MODEL_PROFILE_CHAT": "최근접속 추천모델 → 프로필 → 채팅",
  "NEW_MODEL_PROFILE_CHAT": "신규모델 → 프로필 → 채팅",
  "RECENT_FEMALE_MODEL_PROFILE_CHAT": "최근접속 여성모델 → 프로필 → 채팅",
  "RECENT_MALE_MODEL_PROFILE_CHAT": "최근접속 남성모델 → 프로필 → 채팅",
  "NEARBY_MODEL_PROFILE_CHAT": "내주변 모델 → 프로필 → 채팅",
  "BEAUTY_MODEL_PROFILE_CHAT": "뷰티(네일,반영구 등)모델 → 프로필 → 채팅",
  "ACTIVE_MODEL_PROFILE_CHAT": "활동 모델 → 프로필 → 채팅",
  "FAVORITE_MODEL_PROFILE_CHAT": "관심 고객 → 모델 프로필 → 채팅",
  "QUICK_MATCHING_GENERAL_MODEL_PROFILE_CHAT": "일반 빠른매칭 → 모델 프로필 → 채팅",
  "QUICK_MATCHING_PREMIUM_MODEL_PROFILE_CHAT": "프리미엄 빠른매칭 → 모델 프로필 → 채팅",
  "TOP_ADVISOR_DESIGNER_PROFILE_MENU_INQUIRY": "상담왕 → 프로필 → 메뉴 문의",
  "RECOMMENDER_DESIGNER_PROFILE_MENU_INQUIRY": "채팅 많은 디자이너 → 프로필 → 메뉴 문의",
  "NO_FACE_SHOOTING_DESIGNER_PROFILE_MENU_INQUIRY": "얼굴 촬영 없음 → 프로필 → 메뉴 문의",
  "SEARCH_MAP_DESIGNER_PROFILE_MENU_INQUIRY": "지도 검색 → 프로필 → 메뉴 문의",
  "FAVORITE_NOTIFICATION_MODEL_PROFILE_CHAT": "관심 알림 → 모델 프로필 → 채팅",
  "HAIR_CONSULTATION_ANSWER_NOTIFICATION_MODEL_PROFILE_CHAT": "헤어컨설팅 답변 관련 알림 → 모델 프로필 → 채팅",
  "STORELINK_NOTIFICATION_MODEL_PROFILE_CHAT": "매장 링크 관련 알림 → 모델 프로필 → 채팅",
  "INSTAGRAM_NOTIFICATION_MODEL_PROFILE_CHAT": "인스타그램 관련 알림 → 모델 프로필 → 채팅",
  "model_home": "모델 메인",
  "designer_home": "디자이너 메인",
  "designer_profile": "디자이너 프로필",
  "model_profile": "모델 프로필",
  "menu_detail": "메뉴 상세",
  "inquiry": "문의하기",
  "direct": "바로 선택",
  "more": "더보기",
  "detail": "상세",
  "quick_matching_detail": "빠른매칭 상세",
  "quick_matching_list": "빠른매칭 목록",
  "premium_quick_matching": "프리미엄 빠른매칭",
  "model_search": "모델 검색",
  "designer_search": "디자이너 검색",
  "designer_map": "지도 검색",
  "hair_consultation": "헤어컨설팅",
  "response_detail": "답변 상세",
  "post_comment": "게시글 답변",
  "author_contact": "답변 작성 후 글쓴이 연락",
  "notification_inbox": "알림함",
  "favorites_sent": "보낸 관심",
  "favorites_received": "받은 관심",
  "profile": "프로필",
  "existing_chat": "기존 채팅 다시 열기",
  "chat_room": "채팅방",
  "received_chat": "받은 채팅",
  "chat_start_sheet": "문의 확인창",
  "omitted_steps": "중간 경로 일부 생략",
  "blocked_users": "차단 관리",
  "modelMatching": "모델모집",
  "hairConsultation": "헤어컨설팅",
  "comment": "댓글",
  "favorites": "관심 목록",
  "received": "받은 관심",
  "sent": "보낸 관심",
  "unknown": "출처 확인 불가",
  "external": "외부 진입",
  "experienceGroup": "체험단",
  "reviewSpecial": "리뷰특가",
  "RESUME": "이력서 보고 제안",
  "JOB_POSTING": "구인공고 보고 지원",
  "top_advisor": "상담왕",
  "recent_match": "최근 매칭 안심 파트너",
  "popularDesigner": "채팅 많은 디자이너",
  "new": "추천 디자이너",
  "recent": "최근 접속 디자이너",
  "free": "무료시술 디자이너",
  "nearby": "내주변 디자이너",
  "beauty": "뷰티",
  "pay": "최근접속 추천모델",
  "longTime": "내주변 모델",
  "recent_female": "최근접속 여성모델",
  "recent_male": "최근접속 남성모델"
};
// App titles: HomeModelSectionPresentation and DesignerSuggestionScreen.
// The same section keys (new/beauty) name different lists in the two home screens.
const homeSectionLabels: Record<string, Record<string, string>> = {
  designer_home: {
    pay: '최근접속 추천모델', recent_female: '최근접속 여성모델',
    recent_male: '최근접속 남성모델', new: '신규모델',
    longTime: '내주변 모델', beauty: '뷰티(네일,반영구 등)모델',
  },
  model_home: {
    popularDesigner: '채팅 많은 디자이너', new: '추천 디자이너',
    recent: '최근 접속 디자이너', free: '무료시술 디자이너',
    '무료로 해주는': '무료시술 디자이너', nearby: '내주변 디자이너',
    beauty: '뷰티시술 디자이너',
  },
};
export function routeLabel(value: unknown): string {
  const parts = String(value ?? "unknown").split(">");
  return parts.map((part, index) =>
    (index === 1 ? homeSectionLabels[parts[0]]?.[part] : undefined)
      ?? labels[part] ?? part).join(" → ");
}

export function connectionLabel(row: Record<string, unknown>): string {
  if (row.status === 'created') return '새 채팅 연결';
  if (row.status === 'started') return '처리 시작';
  if (row.status === 'failed') return '실패';
  const attribution = row.attribution && typeof row.attribution === 'object'
    ? row.attribution as Record<string, unknown> : {};
  if (attribution.connectionKind === 'received_first_open') return '받은 채팅 최초 개방';
  if (attribution.connectionKind === 'inquiry') return '다시 문의해서 연결';
  if (attribution.connectionKind === 'visit') {
    return ({ chat_list: '채팅 목록에서 열기', push: '푸시에서 열기', notification_inbox: '알림함에서 열기', profile: '프로필에서 열기' } as Record<string, string>)[String(attribution.section)] ?? '기존 방 열기';
  }
  // Older records did not distinguish opening from visiting; do not infer it.
  return '기존 방 연결 (동작 미분류)';
}
