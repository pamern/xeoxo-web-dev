"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("[app/global-error]", {
    message: error.message,
    digest: error.digest,
    stack: error.stack,
  });

  return (
    <html lang="vi">
      <body>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, fontFamily: "sans-serif" }}>
          <section style={{ maxWidth: 520, textAlign: "center" }}>
            <h1>Có lỗi xảy ra</h1>
            <p>Ứng dụng đang gặp lỗi tạm thời. Vui lòng thử lại.</p>
            <button type="button" onClick={reset}>
              Thử lại
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
