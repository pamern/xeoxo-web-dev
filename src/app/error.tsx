"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("[app/error]", {
    message: error.message,
    digest: error.digest,
    stack: error.stack,
  });

  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-site flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-bold">Có lỗi xảy ra</h1>
      <p className="max-w-xl text-sm text-black/70">
        Trang đang gặp lỗi tạm thời. Vui lòng thử tải lại.
      </p>
      <button
        type="button"
        onClick={reset}
        className="h-11 rounded-pill bg-black px-7 text-sm font-bold text-white"
      >
        Thử lại
      </button>
    </main>
  );
}
