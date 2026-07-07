"use client";

import { useState } from "react";
import Image from "next/image";
import {
  QUIZ_QUESTIONS,
  SEASON_LABEL,
  computeQuizResult,
  type QuizAnswer,
} from "@/features/personal-color/personal-color-quiz";

// Giao diện quiz "Find your Personal Color" — logic chấm điểm đã nối, màn kết quả tạm mock text đơn giản.
export function PersonalColorQuiz() {
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const currentIndex = answers.length;
  const currentQuestion = QUIZ_QUESTIONS[currentIndex];

  if (!currentQuestion) {
    const result = computeQuizResult(answers);

    return (
      <section className="mx-auto w-full max-w-[650px] px-6 py-16 text-center xl:px-0">
        <h2 className="text-2xl font-extrabold">Kết quả của bạn</h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Personal color của bạn là{" "}
          <span className="font-bold text-foreground">
            {SEASON_LABEL[result.season]}
          </span>
        </p>
      </section>
    );
  }

  const remainingQuestions = QUIZ_QUESTIONS.length - currentQuestion.number;

  function handleSelect(tag: QuizAnswer["tag"]) {
    setAnswers((prev) => [
      ...prev,
      { questionNumber: currentQuestion.number, tag, weight: currentQuestion.weight },
    ]);
  }

  return (
    <section className="mx-auto w-full max-w-[650px] px-6 py-10 xl:px-0">
      <h2 className="text-2xl font-extrabold">Câu {currentQuestion.number}.</h2>
      <p className="mt-3 text-lg text-muted-foreground">{currentQuestion.text}</p>

      <div className="mt-8 flex flex-col gap-6">
        {currentQuestion.options.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => handleSelect(option.tag)}
            className="group flex h-[140px] overflow-hidden rounded-md border border-black/10 text-left shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex flex-1 flex-col justify-center gap-2 px-8">
              <span className="text-xl font-extrabold">{option.key}.</span>
              <span className="text-lg font-medium">{option.text}</span>
            </div>
            <div className="relative w-[220px] shrink-0">
              <Image
                src={option.image}
                alt={option.text}
                fill
                sizes="220px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-center gap-3">
        <p className="text-sm text-muted-foreground">
          Còn {remainingQuestions} câu hỏi
        </p>
        <div className="flex items-center gap-2" aria-hidden>
          {QUIZ_QUESTIONS.map((question) => (
            <span
              key={question.number}
              className={
                question.number === currentQuestion.number
                  ? "h-2.5 w-2.5 rounded-full bg-foreground"
                  : "h-2.5 w-2.5 rounded-full border border-foreground/40"
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
