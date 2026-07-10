"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type AppointmentCancelConfirmModalProps = {
  appointment: {
    appointment_id: number;
    branch_name: string;
    date_label: string;
  };
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function AppointmentCancelConfirmModal({
  appointment,
  isSubmitting,
  onClose,
  onConfirm,
}: AppointmentCancelConfirmModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [modalOffset, setModalOffset] = useState({ x: 0, y: 0 });
  const dragStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setModalOffset({ x: 0, y: 0 });
    dragStateRef.current = null;
  }, [appointment.appointment_id]);

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      const dragState = dragStateRef.current;

      if (!dragState || event.pointerId !== dragState.pointerId) {
        return;
      }

      setModalOffset({
        x: dragState.originX + (event.clientX - dragState.startX),
        y: dragState.originY + (event.clientY - dragState.startY),
      });
    }

    function handlePointerUp(event: PointerEvent) {
      if (dragStateRef.current?.pointerId === event.pointerId) {
        dragStateRef.current = null;
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSubmitting, onClose]);

  function handleDragStart(event: React.PointerEvent<HTMLDivElement>) {
    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: modalOffset.x,
      originY: modalOffset.y,
    };
  }

  if (!isMounted) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[260] bg-black/45 px-4">
      <div
        className="flex min-h-full items-center justify-center"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget && !isSubmitting) {
            onClose();
          }
        }}
      >
        <div
          className="w-full max-w-[520px] rounded-[28px] bg-white p-7 shadow-[0_26px_70px_rgba(0,0,0,0.24)] md:p-8"
          style={{
            transform: `translate(${modalOffset.x}px, ${modalOffset.y}px)`,
          }}
        >
          <div
            className="-mx-2 -mt-2 mb-4 flex cursor-grab touch-none justify-center rounded-[18px] px-2 py-2 active:cursor-grabbing"
            onPointerDown={handleDragStart}
          >
            <span
              aria-hidden
              className="h-1.5 w-12 rounded-full bg-black/12"
            />
          </div>

          <Image
            src="/images/logohong.png"
            alt="Xéo Xọ"
            width={122}
            height={72}
            className="h-auto w-[78px] md:w-[90px]"
            priority
          />
          <h2 className="mt-3 text-[30px] font-extrabold leading-none text-foreground">
            Xác nhận hủy lịch?
          </h2>
          <p className="mt-4 text-sm leading-6 text-foreground/72 md:text-base">
            Lịch hẹn tại {appointment.branch_name} vào{" "}
            {appointment.date_label.toLowerCase()} sẽ được chuyển sang trạng thái
            đã hủy.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="inline-flex min-h-[50px] items-center justify-center rounded-full border border-black/20 px-7 text-sm font-semibold text-foreground transition-colors hover:bg-black/[0.03] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting}
              className="inline-flex min-h-[50px] min-w-[156px] items-center justify-center whitespace-nowrap rounded-full bg-black px-8 text-sm font-bold uppercase tracking-[0.03em] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Đang xử lý..." : "Xác nhận hủy"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
