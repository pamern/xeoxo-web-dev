import Image from "next/image";
import { AppointmentForm } from "@/components/organisms/AppointmentForm";
import type { SelectOption } from "@/components/molecules/SelectField";
import type { TimeSlot } from "@/components/molecules/TimeSlotPicker";

export function AppointmentModal({
  branches,
  timeSlots,
  onClose,
}: {
  branches: SelectOption[];
  timeSlots: TimeSlot[];
  onClose?: () => void;
}) {
  return (
    <section className="relative mx-auto w-full max-w-[860px] rounded-[26px] bg-white px-4 pb-4 pt-6 shadow-[0_16px_38px_rgba(0,0,0,0.18)] sm:px-5 md:px-7 md:pb-6 md:pt-7">
      <button
        type="button"
        aria-label="Đóng"
        onClick={onClose}
        className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full transition-opacity hover:opacity-65 md:right-6 md:top-6"
      >
        <Image src="/icons/close.svg" alt="" width={22} height={22} aria-hidden />
      </button>

      <header className="mb-5 flex flex-col items-center text-center">
        <h1 className="pr-10 text-[28px] font-bold uppercase leading-tight tracking-normal text-black sm:pr-0 md:text-[38px]">
          ĐẶT LỊCH MAY ĐO
        </h1>
        <div
          aria-hidden
          className="mt-1.5 h-1 w-[min(280px,64vw)] bg-cover bg-center"
          style={{ backgroundImage: "url(/images/bg-gia-nhap-btn.png)" }}
        />
      </header>

      <div className="mx-auto w-full max-w-[720px] overflow-visible rounded-t-[28px] border border-black bg-white shadow-[0_4px_10px_rgba(0,0,0,0.12)]">
        <AppointmentForm branches={branches} timeSlots={timeSlots} />
      </div>
    </section>
  );
}
