import { sendPushNotification } from "@/apis/push-notification";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../ui/select";

import { Button } from "../ui/button";
import { CardDescription } from "../ui/card";
import { ChatChannelType } from "@/types/chat";
import { toast } from "sonner";
import { useSendSystemMessage } from "@/hooks/use-send-system-message-query";
import { useState } from "react";
import { incrementChatUnreadCount } from "@/apis/chatting/increment-chat-unread-count";

// 메시지 리스트와 안내 문구를 객체 배열로 관리
const MESSAGE_OPTIONS = [
  {
    label: "과도한 영업",
    type: "system",
    // type: "warningNormal",
    value:
      "단순 영업 활동 및 과도한 재료비 요구 시 서비스 이용에 제한이 발생할 수 있습니다."
  },
  {
    label: "타 플랫폼 유도",
    type: "system",
    // type: "warningNormal",
    value:
      "매칭 전 미몽 외부(인스타, 카카오톡, 연락처 등)로 유도 시 이용이 제한될 수 있습니다. 타 플랫폼 링크는 프로필에 등록할 수 있습니다."
  },
  {
    label: "부적절한 언행",
    type: "system",
    // type: "warningStrong",
    value:
      "부적절한 언행이 감지될 경우 서비스 이용에 제한이 발생할 수 있습니다."
  },
  {
    label: "일방적인 약속 변경/취소",
    type: "system",
    // type: "warningNormal",
    value:
      "일방적인 약속 변경, 취소 및 노쇼가 반복될 경우 서비스 이용에 제한이 발생할 수 있습니다."
  },
  {
    label: "개인정보 요구",
    type: "system",
    // type: "warningStrong",
    value: "부적절한 개인정보 요구 시 서비스 이용에 제한이 발생할 수 있습니다."
  },
  {
    label: "강제종료 고지",
    type: "system",
    // type: "warningStrong",
    value:
      "부적절한 사용이 반복될 시 모든 채팅방이 강제 종료되며 채팅서비스도 불가합니다.(1차)"
  },
  {
    label: "강제종료 재고지",
    type: "system",
    // type: "warningStrong",
    value:
      "부적절한 사용이 반복될 시 모든 채팅방이 강제 종료되며 채팅서비스도 불가합니다.(2차)"
  }
];

interface Props {
  channelId: string;
  channelType?: ChatChannelType;
}

// description 안내문구를 재사용할 수 있도록 컴포넌트로 분리
function MessageDescription({
  description,
  minHeight = 100,
  type
}: {
  description?: string;
  minHeight?: number;
  type?: string;
}) {
  const isWarningStrong = type === "warningStrong";
  return (
    <div className={`min-h-[${minHeight}px] flex items-center justify-center`}>
      {description ? (
        <CardDescription className={isWarningStrong ? "text-red-500" : ""}>
          {description}
        </CardDescription>
      ) : (
        <CardDescription className="invisible">placeholder</CardDescription>
      )}
    </div>
  );
}

export default function SystemMessageButton({
  channelId,
  channelType = "model-matching"
}: Props) {
  const [open, setOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<
    (typeof MESSAGE_OPTIONS)[0] | null
  >(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // 시스템 메시지 전송 mutation
  const sendSystemMessage = useSendSystemMessage();

  const handleDialogOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSelectedMessage(null);
      setConfirmOpen(false);
    }
  };

  // 실제 전송 함수
  const handleSend = async () => {
    if (!selectedMessage) return;
    try {
      const target = await sendSystemMessage.mutateAsync({
        channelId,
        message: selectedMessage.value,
        type: selectedMessage.type,
        channelType
      });

      const [unreadResults, pushResults] = await Promise.all([
        Promise.allSettled(
          target.participantIds.map((userId) =>
            incrementChatUnreadCount(userId)
          )
        ),
        Promise.allSettled(
          target.participantIds.map((userId) =>
            sendPushNotification({
              userId,
              message: selectedMessage.value,
              channelId,
              channelType
            })
          )
        )
      ]);

      setConfirmOpen(false);
      setOpen(false);
      setSelectedMessage(null);
      const failedPushCount = pushResults.filter(
        (result) => result.status === "rejected"
      ).length;
      const failedUnreadCount = unreadResults.filter(
        (result) => result.status === "rejected"
      ).length;
      if (failedPushCount > 0 || failedUnreadCount > 0) {
        toast.warning(
          `시스템 메시지는 저장됐지만 배지 갱신 ${failedUnreadCount}건, 푸시 ${failedPushCount}건이 실패했습니다.`
        );
      } else {
        toast.success(
          "시스템 메시지, 미읽음 배지 갱신, 푸시알림이 모두 처리되었습니다."
        );
      }
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch {
      toast.error("시스템 메시지 저장에 실패했습니다.");
    }
  };

  return (
    <div className="flex mb-4 justify-end">
      <Button
        onClick={() => setOpen(true)}
        variant="default"
        className="cursor-pointer"
      >
        시스템 메시지
      </Button>
      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>시스템 메시지 전송</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-2">
              <Select
                value={selectedMessage?.value || ""}
                onValueChange={(value) => {
                  const found =
                    MESSAGE_OPTIONS.find((opt) => opt.value === value) || null;
                  setSelectedMessage(found);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="전송할 메시지 선택" />
                </SelectTrigger>
                <SelectContent>
                  {MESSAGE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <MessageDescription
              description={selectedMessage?.value}
              minHeight={100}
              type={selectedMessage?.type}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button
              type="button"
              disabled={!selectedMessage}
              onClick={() => setConfirmOpen(true)}
            >
              보내기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* 확인용 Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>정말 전송할까요?</DialogTitle>
          </DialogHeader>
          <MessageDescription
            description={selectedMessage?.value}
            minHeight={32}
            type={selectedMessage?.type}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              취소
            </Button>
            <Button
              type="button"
              onClick={handleSend}
              disabled={sendSystemMessage.isPending}
            >
              {sendSystemMessage.isPending ? "전송 중..." : "확인"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
