"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ProductGrid } from "@/components/organisms/ProductGrid";
import { StarsBanner } from "@/components/organisms/StarsBanner";
import {
  QUIZ_QUESTIONS,
  SEASON_LABEL,
  computeQuizResult,
  type QuizAnswer,
  type QuizResult,
} from "@/features/personal-color/personal-color-quiz";
import type { Product } from "@/types/product.types";

type PersonalColorSwatch = { colorId: number; name: string; hex: string };

type PersonalColorResultData = {
  resultId?: number;
  palette: PersonalColorSwatch[];
  products: Product[];
  description: string;
};

// Giao diện quiz "Find your Personal Color": logic chấm điểm + màn kết quả
// nối API thật (/api/v1/personal-color/result), hiện bảng màu và sản phẩm gợi
// ý khớp với season theo đúng dữ liệu màu thật trong DB.
export function PersonalColorQuiz() {
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Array<QuizAnswer | null>>(() =>
    QUIZ_QUESTIONS.map(() => null),
  );
  const [finished, setFinished] = useState(false);

  function resetQuiz() {
    setStarted(false);
    setFinished(false);
    setCurrentIndex(0);
    setAnswers(QUIZ_QUESTIONS.map(() => null));
  }

  if (finished) {
    const result = computeQuizResult(
      answers.filter((answer): answer is QuizAnswer => answer !== null),
    );
    return (
      <PersonalColorResult
        result={result}
        onRestart={() => {
          setStarted(true);
          setFinished(false);
          setCurrentIndex(0);
          setAnswers(QUIZ_QUESTIONS.map(() => null));
        }}
        onGoHome={resetQuiz}
      />
    );
  }

  const currentQuestion = QUIZ_QUESTIONS[currentIndex];
  const currentAnswer = answers[currentIndex];

  function goToQuestion(nextIndex: number) {
    if (nextIndex < 0) return;
    if (nextIndex >= QUIZ_QUESTIONS.length) {
      setFinished(true);
      return;
    }
    setCurrentIndex(nextIndex);
  }

  function handleSelect(tag: QuizAnswer["tag"]) {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = {
        questionNumber: currentQuestion.number,
        tag,
        weight: currentQuestion.weight,
      };
      return next;
    });
    goToQuestion(currentIndex + 1);
  }

  return (
    <div className="w-full flex flex-col items-center">
      {/* Banner image shown only when playing the quiz */}
      <section className="mx-auto mt-4 w-[calc(100%-3rem)] max-w-[1728px] bg-white">
        <Image
          src="/images/homepage_personal_color.png"
          alt="Find your personal color"
          width={1728}
          height={615}
          priority
          sizes="(max-width: 1776px) calc(100vw - 3rem), 1728px"
          className="h-auto w-full"
        />
      </section>

      {!started ? (
        <PersonalColorIntro onStart={() => setStarted(true)} />
      ) : (
        <section className="mx-auto w-full max-w-[650px] px-6 py-10 xl:px-0">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-extrabold">
              Câu {currentQuestion.number}.
            </h2>
            <button
              type="button"
              onClick={resetQuiz}
              className="text-body-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
            >
              Về trang giới thiệu
            </button>
          </div>
          <p className="mt-3 text-lg text-muted-foreground">
            {currentQuestion.text}
          </p>

          <div className="mt-8 flex flex-col gap-6">
            {currentQuestion.options.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => handleSelect(option.tag)}
                className={
                  "group relative flex h-[150px] overflow-hidden rounded-sm border text-left shadow-md transition-shadow hover:shadow-lg " +
                  (currentAnswer?.tag === option.tag
                    ? "border-primary ring-1 ring-primary"
                    : "border-black/10")
                }
              >
                <Image
                  src={option.image}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 650px"
                  className="object-cover"
                />
                <div className="relative z-10 flex w-[58%] flex-col justify-center gap-2 px-8 sm:px-10">
                  <span className="text-xl font-extrabold">{option.key}.</span>
                  <span className="text-lg font-medium">{option.text}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <div>
              {currentIndex > 0 && (
                <button
                  type="button"
                  onClick={() => goToQuestion(currentIndex - 1)}
                  className="rounded-pill border border-black/20 px-6 py-2.5 text-body-sm font-medium transition-colors hover:bg-secondary"
                >
                  &larr; Câu trước
                </button>
              )}
            </div>

            <div className="flex items-center gap-2" aria-hidden>
              {QUIZ_QUESTIONS.map((question, index) => (
                <span
                  key={question.number}
                  className={
                    index === currentIndex
                      ? "h-2.5 w-2.5 rounded-full bg-foreground"
                      : "h-2.5 w-2.5 rounded-full border border-foreground/40"
                  }
                />
              ))}
            </div>

            <div />
          </div>
        </section>
      )}
    </div>
  );
}

const SEASON_TEASERS: { label: string; swatches: string[] }[] = [
  { label: "Xuân", swatches: ["#F28C28", "#E3B23C", "#F4A08A"] },
  { label: "Hạ", swatches: ["#F6C1CC", "#C8B4E3", "#8CBFD9"] },
  { label: "Thu", swatches: ["#B88A3B", "#708238", "#8B1E2D"] },
  { label: "Đông", swatches: ["#1F1F1F", "#C62828", "#1F5AA6"] },
];

const QUIZ_STEPS = [
  {
    title: "Trả lời 5 câu hỏi",
    detail: "Về màu da, mạch máu và tóc tự nhiên.",
  },
  {
    title: "Hệ thống phân tích",
    detail: "Chấm điểm và xác định nhóm mùa phù hợp.",
  },
  {
    title: "Nhận kết quả",
    detail: "Bảng màu + gợi ý sản phẩm thật từ XÉO XỌ.",
  },
];

function PersonalColorIntro({ onStart }: { onStart: () => void }) {
  return (
    <section className="relative w-full overflow-hidden bg-secondary/30 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#F28C28_0%,#F6C1CC_33%,#708238_66%,#1F5AA6_100%)]"
      />

      <div className="mx-auto w-full max-w-[720px] px-6 text-center xl:px-0">
        <span className="inline-flex items-center rounded-pill border border-primary/40 bg-primary/10 px-4 py-1.5 text-caption font-medium uppercase tracking-wide text-primary">
          Tính năng mới
        </span>

        <h1 className="mt-5 text-3xl font-extrabold uppercase leading-tight md:text-4xl">
          Personal Color là gì?
        </h1>
        <p className="mx-auto mt-4 max-w-[580px] text-lg leading-relaxed text-muted-foreground">
          Personal Color là phương pháp phân tích tông màu tự nhiên của da, tóc
          và đôi mắt để tìm ra bảng màu trang phục tôn lên vẻ đẹp riêng của bạn
          nhất.
        </p>

        <div className="mt-9 grid grid-cols-2 gap-3 md:grid-cols-4">
          {SEASON_TEASERS.map((season) => (
            <div
              key={season.label}
              className="rounded-md border border-black/10 bg-background px-4 py-4 shadow-sm"
            >
              <div className="flex justify-center -space-x-2">
                {season.swatches.map((hex) => (
                  <span
                    key={hex}
                    aria-hidden
                    className="h-7 w-7 rounded-full border-2 border-background shadow-sm"
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
              <p className="mt-3 text-body-sm font-bold uppercase">
                {season.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-lg border border-black/10 bg-background px-6 py-7 text-left shadow-sm md:px-10">
          <h2 className="text-center text-lg font-bold uppercase">
            Về bài quiz này
          </h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3 md:gap-4">
            {QUIZ_STEPS.map((step, index) => (
              <div
                key={step.title}
                className="flex flex-col items-center gap-2 text-center"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-body-sm font-bold text-primary-foreground">
                  {index + 1}
                </span>
                <p className="whitespace-nowrap text-[14px] font-bold leading-[1.15] sm:text-[15px]">
                  {step.title}
                </p>
                <p className="text-body-sm text-muted-foreground">
                  {step.detail}
                </p>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onStart}
          className="mt-10 inline-flex h-[52px] items-center justify-center gap-2 rounded-pill bg-primary px-10 text-button font-bold uppercase text-primary-foreground shadow-[0_10px_24px_rgba(0,0,0,0.15)] transition-transform hover:scale-[1.02] hover:opacity-90"
        >
          Bắt đầu làm quiz
          <span aria-hidden>&rarr;</span>
        </button>
      </div>
    </section>
  );
}

function PersonalColorResult({
  result,
  onRestart,
  onGoHome,
}: {
  result: QuizResult;
  onRestart: () => void;
  onGoHome: () => void;
}) {
  const [data, setData] = useState<PersonalColorResultData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>();

  useEffect(() => {
    let cancelled = false;

    async function loadResult() {
      setIsLoading(true);
      setErrorMessage(undefined);

      try {
        const response = await fetch("/api/v1/personal-color/result", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            temperature: result.temperature,
            value: result.value,
            season: result.season,
          }),
        });
        const payload = (await response.json()) as {
          success: boolean;
          data?: PersonalColorResultData;
          message?: string;
        };

        if (!response.ok || !payload.success || !payload.data) {
          throw new Error(
            payload.message ?? "Không thể tải kết quả personal color.",
          );
        }

        if (!cancelled) {
          setData(payload.data);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Không thể tải kết quả personal color.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadResult();
    return () => {
      cancelled = true;
    };
  }, [result]);

  return (
    <div className="w-full">
      {/* Headings section (Padded) */}
      <section className="mx-auto w-full max-w-site px-6 pt-12 xl:px-[100px] text-center">
        <h1 className="text-3xl font-extrabold uppercase leading-tight md:text-4xl">
          Personal color của bạn là
        </h1>
        <p className="mt-2 text-2xl font-bold text-primary">
          {SEASON_LABEL[result.season]}
        </p>
      </section>

      {/* Result banner section (Full Bleed - Edge to Edge) */}
      <section className="relative mt-8 w-full aspect-[1728/615] overflow-hidden bg-slate-100">
        <style>{`
          @keyframes oceanWaves {
            0% {
              transform: translate(0, 0) scale(1.05) rotate(0deg);
            }
            50% {
              transform: translate(-2.5%, 2%) scale(1.16) rotate(1.2deg);
            }
            100% {
              transform: translate(0, 0) scale(1.05) rotate(0deg);
            }
          }
          .animate-ocean-waves {
            animation: oceanWaves 10s ease-in-out infinite;
          }
          @keyframes waterCausticsAnimation {
            0% {
              background-position: 0% 0%;
              transform: scale(1.05) rotate(0deg);
            }
            25% {
              background-position: 5% 10%;
              transform: scale(1.1) rotate(0.8deg);
            }
            50% {
              background-position: -5% 15%;
              transform: scale(1.15) rotate(-0.8deg);
            }
            75% {
              background-position: 10% -5%;
              transform: scale(1.1) rotate(0.4deg);
            }
            100% {
              background-position: 0% 0%;
              transform: scale(1.05) rotate(0deg);
            }
          }
          .water-caustics {
            position: absolute;
            inset: -40px; /* Bleed out to cover edges during scale & rotate */
            background-image: url('/images/personal-color/water-caustics.png');
            background-size: cover;
            background-repeat: repeat;
            mix-blend-mode: overlay;
            opacity: 0.35;
            pointer-events: none;
            animation: waterCausticsAnimation 15s ease-in-out infinite;
            z-index: 5;
          }
        `}</style>
        
        {/* Back Image (Background) with animation */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <Image
            src={`/images/personal-color/ket-qua/Back/Mùa ${{
              SPRING: "Xuân",
              SUMMER: "Hạ",
              AUTUMN: "Thu",
              WINTER: "Đông",
            }[result.season]}.png`}
            alt=""
            fill
            sizes="100vw"
            className="object-cover animate-ocean-waves origin-center"
            priority
          />
          {/* Water Caustics Shimmer Overlay nested inside Back container */}
          <div className="water-caustics" />
        </div>

        {/* Front Image (Overlay) */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <Image
            src={`/images/personal-color/ket-qua/Front/Mùa ${{
              SPRING: "Xuân",
              SUMMER: "Hạ",
              AUTUMN: "Thu",
              WINTER: "Đông",
            }[result.season]}.png`}
            alt={SEASON_LABEL[result.season]}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
      </section>

      {/* Recommendations & products section (Padded) */}
      <section className="mx-auto w-full max-w-site px-6 py-12 xl:px-[100px]">
        {isLoading && (
          <p className="mt-10 text-center text-body-lg text-muted-foreground">
            Đang tải bảng màu phù hợp với bạn...
          </p>
        )}

        {errorMessage && (
          <p className="mt-10 text-center text-body-lg text-destructive">
            {errorMessage}
          </p>
        )}

        {data && (
          <>
            <div className="mx-auto mt-8 max-w-[650px] text-center">
              <h2 className="text-xl font-bold uppercase">Màu sắc đề xuất</h2>
              <p className="mt-2 text-body-sm text-muted-foreground">
                {data.description}
              </p>
            </div>

            <div className="mx-auto mt-6 flex max-w-[650px] flex-wrap items-center justify-center gap-4">
              {data.palette.map((swatch) => (
                <span
                  key={swatch.colorId}
                  title={swatch.name}
                  aria-label={swatch.name}
                  className="h-10 w-10 shrink-0 rounded-full border border-black/10 shadow-[0_1px_4px_rgba(0,0,0,0.15)]"
                  style={{ backgroundColor: swatch.hex }}
                />
              ))}
            </div>

            {/* Action Buttons Panel (Above suggested products) */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={onRestart}
                className="w-full sm:w-auto rounded-pill bg-black px-8 py-3 text-body-sm font-bold uppercase text-white transition-colors hover:bg-black/85"
              >
                Làm lại quiz
              </button>
              <button
                type="button"
                onClick={onGoHome}
                className="w-full sm:w-auto rounded-pill border border-black px-8 py-3 text-body-sm font-bold uppercase text-black transition-colors hover:bg-black/5"
              >
                Quay về trang chính
              </button>
            </div>

            {data.products.length > 0 && (
              <div className="mt-14 border-t border-black/10 pt-10">
                <h2 className="mb-6 text-2xl font-medium uppercase">
                  Có thể bạn sẽ thích
                </h2>
                <ProductGrid
                  products={data.products}
                  className="gap-x-7 gap-y-12"
                  cardClassName="gap-2"
                  cardImageClassName="aspect-[351/430]"
                />
              </div>
            )}
          </>
        )}

        <div className="mt-16">
          <StarsBanner />
        </div>
      </section>
    </div>
  );
}
