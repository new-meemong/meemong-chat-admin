import assert from "node:assert/strict";
import test from "node:test";

import {
  parseChatV2ChannelIdentity,
  parseChatV2ChannelInsights
} from "./chat-v2-contract.ts";

function modelMatchingChannel(overrides: Record<string, unknown> = {}) {
  const channelId = "v2_modelMatching_CHAT_0_12_57_1";
  return {
    documentId: channelId,
    chatType: "model-matching" as const,
    rawData: {
      schemaVersion: 2,
      channelId,
      channelType: "modelMatching",
      postType: "CHAT",
      postId: "0",
      answerId: null,
      participantIds: ["12", "57"],
      participantsIds: ["12", "57"],
      channelOpenUserId: "57",
      roomInstanceId: "1",
      ...overrides
    }
  };
}

test("v2 모델매칭 identity와 불변/활성 참여자를 분리해 읽는다", () => {
  const result = parseChatV2ChannelIdentity(
    modelMatchingChannel({ participantsIds: ["12"] })
  );

  assert.deepEqual(result.participantIds, [12, 57]);
  assert.deepEqual(result.activeParticipantIds, [12]);
  assert.equal(result.schemaVersion, 2);
  assert.equal(result.postType, "CHAT");
});

test("채널 생성 진입경로·과금문맥·첫 답장 상태를 정본 필드에서 읽는다", () => {
  const rawData = modelMatchingChannel({
    originEntrySource: "NEARBY_MODEL_PROFILE_CHAT",
    originPricingType: "longTime",
    hasFirstReply: true
  }).rawData;

  assert.deepEqual(parseChatV2ChannelInsights(rawData, "CHAT"), {
    originEntrySource: "NEARBY_MODEL_PROFILE_CHAT",
    originPricingType: "longTime",
    hasFirstReply: true
  });
  assert.throws(
    () =>
      parseChatV2ChannelInsights(
        { ...rawData, originEntrySource: "FUTURE_ENTRY_SOURCE" },
        "CHAT"
      ),
    /originEntrySource/
  );
  assert.throws(
    () => parseChatV2ChannelInsights(rawData, "MODEL_ANNOUNCEMENT"),
    /CHAT 이외/
  );
});

test("헤어상담 채널 ID는 postId가 아닌 answerId를 identity로 사용한다", () => {
  const channelId = "v2_hairConsultation_HAIR_CONSULTATION_3501_12_57_2";
  const result = parseChatV2ChannelIdentity({
    documentId: channelId,
    chatType: "hair-consultation",
    rawData: {
      schemaVersion: 2,
      channelId,
      channelType: "hairConsultation",
      postType: "HAIR_CONSULTATION",
      postId: "3000",
      answerId: "3501",
      participantIds: ["12", "57"],
      participantsIds: ["12", "57"],
      channelOpenUserId: "12",
      roomInstanceId: "2"
    }
  });

  assert.equal(result.answerId, "3501");
  assert.equal(result.roomInstanceId, "2");
});

test("레거시 채널과 다른 서비스의 postType은 거부한다", () => {
  assert.throws(
    () =>
      parseChatV2ChannelIdentity(
        modelMatchingChannel({ schemaVersion: 1 })
      ),
    /v2 채널이 아닙니다/
  );
  assert.throws(
    () =>
      parseChatV2ChannelIdentity(
        modelMatchingChannel({ postType: "REVIEW_SPECIAL" })
      ),
    /postType이 channelType과 맞지 않습니다/
  );
});

test("v2 참여자는 문자열 두 명이며 활성 참여자는 그 부분집합이어야 한다", () => {
  assert.throws(
    () =>
      parseChatV2ChannelIdentity(
        modelMatchingChannel({ participantIds: [12, 57] })
      ),
    /사용자 ID는 문자열이어야 합니다/
  );
  assert.throws(
    () =>
      parseChatV2ChannelIdentity(
        modelMatchingChannel({ participantsIds: ["12", "90"] })
      ),
    /활성 참여자가 불변 참여자 집합과 다릅니다/
  );
});

test("저장 필드에서 파생한 결정적 channelId와 문서 ID가 다르면 거부한다", () => {
  assert.throws(
    () =>
      parseChatV2ChannelIdentity(
        modelMatchingChannel({ roomInstanceId: "2" })
      ),
    /저장된 v2 identity와 일치하지 않습니다/
  );
});

test("순번 도입 전 난수형 roomInstanceId도 v2 채널로 유지한다", () => {
  const roomInstanceId = "pre-sequence-random-id";
  const channelId = `v2_modelMatching_CHAT_0_12_57_${roomInstanceId}`;
  const result = parseChatV2ChannelIdentity({
    ...modelMatchingChannel({ roomInstanceId, channelId }),
    documentId: channelId
  });

  assert.equal(result.roomInstanceId, roomInstanceId);
});
