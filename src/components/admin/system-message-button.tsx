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
import { toast } from "sonner";
import { useSendSystemMessage } from "@/hooks/use-send-system-message-query";
import { useState } from "react";

// 메시지 리스트와 안내 문구를 객체 배열로 관리
const MESSAGE_OPTIONS = [
  {
    label: "과도한 영업",
    value:
      "단순 영업 활동 및 과도한 재료비 요구 시 서비스 이용에 제한이 발생할 수 있습니다."
  },
  {
    label: "타 플랫폼 유도",
    value:
      "타 플랫폼(인스타, 카카오톡, 구글폼 등) 이용 요구 시 서비스 이용에 제한이 발생할 수 있습니다."
  },
  {
    label: "부적절한 언행",
    value:
      "부적절한 언행이 감지될 경우 서비스 이용에 제한이 발생할 수 있습니다."
  },
  {
    label: "일방적인 약속 변경/취소",
    value:
      "일방적인 약속 변경이나 취소가 반복될 경우 서비스 이용에 제한이 발생할 수 있습니다."
  },
  {
    label: "개인정보 요구",
    value: "부적절한 개인정보 요구 시 서비스 이용에 제한이 발생할 수 있습니다."
  },
  {
    label: "강제종료 고지",
    value: "부적절한 사용이 반복될 시 채팅방이 강제 종료될 수 있습니다(1차)."
  },
  {
    label: "강제종료 재고지",
    value: "부적절한 사용이 반복될 시 채팅방이 강제 종료될 수 있습니다(2차)."
  }
];

interface Props {
  channelId: string;
}

// description 안내문구를 재사용할 수 있도록 컴포넌트로 분리
function MessageDescription({
  description,
  minHeight = 100
}: {
  description?: string;
  minHeight?: number;
}) {
  return (
    <div className={`min-h-[${minHeight}px] flex items-center justify-center`}>
      {description ? (
        <CardDescription>{description}</CardDescription>
      ) : (
        <CardDescription className="invisible">placeholder</CardDescription>
      )}
    </div>
  );
}

export default function SystemMessageButton({ channelId }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<
    (typeof MESSAGE_OPTIONS)[0] | null
  >(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  console.log("moonsae channelId", channelId);

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
      await sendSystemMessage.mutateAsync({
        channelId,
        message: selectedMessage.value
      });
      setConfirmOpen(false);
      setOpen(false);
      setSelectedMessage(null);
      toast.success("시스템 메시지가 전송되었습니다.");
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch {
      toast.error("메시지 전송에 실패했습니다.");
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
