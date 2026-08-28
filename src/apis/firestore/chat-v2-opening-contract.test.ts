import assert from "node:assert/strict";
import test from "node:test";
import { Timestamp } from "firebase/firestore";

import {
  getChatV2OpeningLabel,
  getChatV2OriginEntrySourceLabel,
  getChatV2OriginPricingTypeLabel,
  getChatV2PostTypeLabel,
  isPreSequenceV2RoomInstanceId,
  normalizeChatEntrySource
} from "../../components/chat/chat-v2-tag-labels.ts";
import { parseChatV2Opening } from "./chat-v2-opening-contract.ts";

test("앱 채팅 목록과 같은 한글 게시글 유형 태그를 사용한다", () => {
  assert.equal(getChatV2PostTypeLabel("MODEL_ANNOUNCEMENT"), "모델시술");
  assert.equal(getChatV2PostTypeLabel("QUICK_MATCHING_PREMIUM"), "빠른매칭");
  assert.equal(getChatV2PostTypeLabel("QUICK_MATCHING_GENERAL"), "빠른매칭");
  assert.equal(getChatV2PostTypeLabel("EXPERIENCE_GROUP"), "체험단");
  assert.equal(getChatV2PostTypeLabel("HAIR_CONSULTATION"), "컨설팅");
  assert.equal(getChatV2PostTypeLabel("REVIEW_SPECIAL"), "리뷰특가");
  assert.equal(getChatV2PostTypeLabel("JOB_POSTING"), "일자리");
  assert.equal(getChatV2PostTypeLabel("RESUME"), "일자리");
  assert.equal(getChatV2PostTypeLabel("CHAT"), null);
});

test("채팅 생성 진입경로와 과금문맥을 운영용 한글 라벨로 표시한다", () => {
  assert.equal(
    getChatV2OriginEntrySourceLabel("NEARBY_MODEL_PROFILE_CHAT"),
    "내 주변 모델 프로필"
  );
  assert.equal(
    getChatV2OriginEntrySourceLabel(
      "HAIR_CONSULTATION_ANSWER_NOTIFICATION_MODEL_PROFILE_CHAT"
    ),
    "컨설팅 답변 알림의 모델 프로필"
  );
  assert.equal(getChatV2OriginPricingTypeLabel("longTime"), "내 주변 모델");
  assert.equal(
    getChatV2OriginPricingTypeLabel(
      "view_instagram_notification_designer"
    ),
    "인스타그램 알림"
  );
  assert.equal(
    getChatV2OriginEntrySourceLabel("FUTURE_ENTRY_SOURCE"),
    "알 수 없는 경로 (FUTURE_ENTRY_SOURCE)"
  );
});

test("순번 도입 전 v2 방만 레거시 표시 대상으로 분류한다", () => {
  assert.equal(isPreSequenceV2RoomInstanceId("pre-sequence-random-id"), true);
  assert.equal(isPreSequenceV2RoomInstanceId("1"), false);
  assert.equal(isPreSequenceV2RoomInstanceId("2"), false);
});

test("몽·광고·패스 개봉 방법을 무료·유료 사유 태그로 바꾼다", () => {
  assert.equal(
    getChatV2OpeningLabel(
      {
        state: "OPENED",
        method: "MONG",
        openedMongAmount: 20,
        openedAt: null,
        entrySource: null,
        awaitingReply: false,
        awaitingReplyStartedAt: null,
        isChannelRefunded: false,
        isRefundRecipient: false
      },
      "MODEL_ANNOUNCEMENT"
    ),
    "유료[20몽]"
  );
  assert.equal(
    getChatV2OpeningLabel(
      {
        state: "OPENED",
        method: "AD",
        openedMongAmount: null,
        openedAt: null,
        entrySource: null,
        awaitingReply: false,
        awaitingReplyStartedAt: null,
        isChannelRefunded: false,
        isRefundRecipient: false
      },
      "MODEL_ANNOUNCEMENT"
    ),
    "무료[광고]"
  );
  assert.equal(
    getChatV2OpeningLabel(
      {
        state: "OPENED",
        method: "GROWTH_PASS",
        openedMongAmount: null,
        openedAt: null,
        entrySource: null,
        awaitingReply: false,
        awaitingReplyStartedAt: null,
        isChannelRefunded: false,
        isRefundRecipient: false
      },
      "MODEL_ANNOUNCEMENT"
    ),
    "무료[성장패스]"
  );
  assert.equal(
    getChatV2OpeningLabel(
      {
        state: "OPENED",
        method: "MEEMONG_PASS",
        openedMongAmount: null,
        openedAt: null,
        entrySource: null,
        awaitingReply: false,
        awaitingReplyStartedAt: null,
        isChannelRefunded: false,
        isRefundRecipient: false
      },
      "MODEL_ANNOUNCEMENT"
    ),
    "무료[미몽패스]"
  );
});

test("무료 정책은 저장된 게시글 유형과 진입경로로 이유를 구체화한다", () => {
  assert.equal(
    getChatV2OpeningLabel(
      {
        state: "OPENED",
        method: "FREE_POLICY",
        openedMongAmount: null,
        openedAt: null,
        entrySource: "QUICK_MATCHING_PREMIUM_DETAIL_CHAT",
        awaitingReply: false,
        awaitingReplyStartedAt: null,
        isChannelRefunded: false,
        isRefundRecipient: false
      },
      "QUICK_MATCHING_PREMIUM"
    ),
    "무료[프리미엄 빠른매칭]"
  );
  assert.equal(
    getChatV2OpeningLabel(
      {
        state: "OPENED",
        method: "FREE_POLICY",
        openedMongAmount: null,
        openedAt: null,
        entrySource: "TOP_ADVISOR_DESIGNER_PROFILE_MENU_INQUIRY",
        awaitingReply: false,
        awaitingReplyStartedAt: null,
        isChannelRefunded: false,
        isRefundRecipient: false
      },
      "MODEL_ANNOUNCEMENT"
    ),
    "무료[상담왕]"
  );
  assert.equal(
    getChatV2OpeningLabel(
      {
        state: "OPENED",
        method: "FREE_POLICY",
        openedMongAmount: null,
        openedAt: null,
        entrySource: "NO_FACE_SHOOTING_DESIGNER_PROFILE_MENU_INQUIRY",
        awaitingReply: false,
        awaitingReplyStartedAt: null,
        isChannelRefunded: false,
        isRefundRecipient: false
      },
      "MODEL_ANNOUNCEMENT"
    ),
    "무료[얼굴촬영 없는 지원]"
  );
});

test("앱 ChatEntrySource.fromRaw의 레거시·v2 값을 정확 일치로 정규화한다", () => {
  const cases = [
    ["THUNDER_DEFAULT", "thunderDefault"],
    ["QUICK_MATCHING_GENERAL_DETAIL_CHAT", "thunderDefault"],
    [
      "QUICK_MATCHING_GENERAL_DESIGNER_PROFILE_MENU_INQUIRY",
      "thunderDefault"
    ],
    ["THUNDER_PREMIUM", "thunderPremium"],
    ["QUICK_MATCHING_PREMIUM_DETAIL_CHAT", "thunderPremium"],
    [
      "QUICK_MATCHING_PREMIUM_DESIGNER_PROFILE_MENU_INQUIRY",
      "thunderPremium"
    ],
    ["TOP_ADVISOR", "topAdvisor"],
    ["TOP_ADVISOR_DESIGNER_PROFILE_MENU_INQUIRY", "topAdvisor"],
    ["RECOMMENDER_DESIGNER", "recommenderDesigner"],
    [
      "RECOMMENDER_DESIGNER_PROFILE_MENU_INQUIRY",
      "recommenderDesigner"
    ],
    ["NO_FACE_SHOOTING", "noFaceShooting"],
    ["NO_FACE_SHOOTING_DESIGNER_PROFILE_MENU_INQUIRY", "noFaceShooting"],
    ["SEARCH_MAP", "searchMap"],
    ["SEARCH_MAP_DESIGNER_PROFILE_MENU_INQUIRY", "searchMap"]
  ] as const;

  for (const [wireValue, expected] of cases) {
    assert.equal(normalizeChatEntrySource(wireValue), expected, wireValue);
  }
  assert.equal(
    normalizeChatEntrySource("QUICK_MATCHING_PREMIUM_MODEL_PROFILE_CHAT"),
    null
  );
  assert.equal(normalizeChatEntrySource("FUTURE_SOURCE"), null);
});

test("추천 디자이너와 지도 검색은 무료 원인으로 추정하지 않는다", () => {
  for (const entrySource of [
    "RECOMMENDER_DESIGNER_PROFILE_MENU_INQUIRY",
    "SEARCH_MAP_DESIGNER_PROFILE_MENU_INQUIRY",
    "QUICK_MATCHING_PREMIUM_MODEL_PROFILE_CHAT"
  ]) {
    assert.equal(
      getChatV2OpeningLabel(
        {
          state: "OPENED",
          method: "FREE_POLICY",
          openedMongAmount: null,
          openedAt: null,
          entrySource,
          awaitingReply: false,
          awaitingReplyStartedAt: null,
          isChannelRefunded: false,
          isRefundRecipient: false
        },
        "CHAT"
      ),
      "무료[무료 정책]",
      entrySource
    );
  }
});

test("환불 당사자와 결제 성공 후 OPENED 저장 전 과도기를 별도 표시한다", () => {
  const historicalRefundRecipient = parseChatV2Opening({
    openState: "OPENED",
    openMethod: "MONG",
    openedMongAmount: 20,
    isRefunded: true,
    deleteReason: "REFUND_AFTER_NO_REPLY"
  });
  assert.equal(
    getChatV2OpeningLabel(historicalRefundRecipient, "MODEL_ANNOUNCEMENT"),
    "유료[20몽·환불]"
  );

  const finalizedRefund = parseChatV2Opening({
    openState: "NOT_OPENED",
    openMethod: "NONE",
    openedMongAmount: null,
    isRefunded: true,
    deleteReason: "REFUND_AFTER_NO_REPLY"
  });
  assert.equal(finalizedRefund.isChannelRefunded, true);
  assert.equal(finalizedRefund.isRefundRecipient, true);
  assert.equal(
    getChatV2OpeningLabel(finalizedRefund, "MODEL_ANNOUNCEMENT"),
    "환불 완료"
  );

  const pendingOpenMarker = parseChatV2Opening({
    openState: "NOT_OPENED",
    openMethod: "NONE",
    openedMongAmount: null,
    isPaid: true,
    isRefunded: false
  });
  assert.equal(pendingOpenMarker.method, "MONG");
  assert.equal(
    getChatV2OpeningLabel(pendingOpenMarker, "MODEL_ANNOUNCEMENT"),
    "유료[금액 확인중]"
  );
});

test("환불 종료 미러 플래그가 있는 상대방은 원래 개봉 사유를 유지한다", () => {
  const refundPeer = parseChatV2Opening({
    openState: "OPENED",
    openMethod: "AD",
    openedMongAmount: null,
    isRefunded: true,
    otherUserLeft: true
  });

  assert.equal(refundPeer.isChannelRefunded, true);
  assert.equal(refundPeer.isRefundRecipient, false);
  assert.equal(
    getChatV2OpeningLabel(refundPeer, "MODEL_ANNOUNCEMENT"),
    "무료[광고]"
  );
});

test("v2 사용자 메타의 개봉 불변조건과 경로 identity를 검증한다", () => {
  const openedAt = Timestamp.fromMillis(1_700_000_000_000);
  const awaitingReplyStartedAt = Timestamp.fromMillis(1_700_000_010_000);
  const parsed = parseChatV2Opening(
    {
      userId: "12",
      channelId: "channel-1",
      openState: "OPENED",
      openMethod: "MONG",
      openedMongAmount: 20,
      openedAt,
      awaitingReply: true,
      awaitingReplyStartedAt,
      originEntrySource: "MODEL_PROFILE_DIRECT_CHAT"
    },
    { userId: "12", channelId: "channel-1" }
  );
  assert.equal(parsed.openedMongAmount, 20);
  assert.equal(parsed.openedAt, openedAt);
  assert.equal(parsed.awaitingReply, true);
  assert.equal(parsed.awaitingReplyStartedAt, awaitingReplyStartedAt);
  assert.equal(parsed.entrySource, "MODEL_PROFILE_DIRECT_CHAT");
  assert.equal(parsed.isChannelRefunded, false);
  assert.equal(parsed.isRefundRecipient, false);

  assert.throws(
    () =>
      parseChatV2Opening({
        openState: "OPENED",
        openMethod: "MONG",
        openedMongAmount: null
      }),
    /양수 openedMongAmount/
  );
  assert.throws(
    () =>
      parseChatV2Opening({
        openState: "OPENED",
        openMethod: "MONG",
        openedMongAmount: 0
      }),
    /양수 정수/
  );
  assert.throws(
    () =>
      parseChatV2Opening({
        openState: "NOT_OPENED",
        openMethod: "AD",
        openedMongAmount: null
      }),
    /openMethod는 NONE/
  );
});
