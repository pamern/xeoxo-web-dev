// Bộ câu hỏi + logic tính điểm cho quiz "Find your Personal Color".
// Câu hỏi và cách chấm điểm không lưu DB — xử lý hoàn toàn ở FE/BE (xem docs/database/database_schema.md#PERSONAL_COLOR_RESULT).

export type Temperature = "WARM" | "COOL";
export type Value = "LIGHT" | "DEEP";
export type Season = "SPRING" | "SUMMER" | "AUTUMN" | "WINTER";

type OptionTag = Temperature | Value;

export type QuizOption = {
  key: "A" | "B";
  text: string;
  tag: OptionTag;
  image: string;
};

export type QuizQuestion = {
  number: number;
  text: string;
  weight: number;
  options: [QuizOption, QuizOption];
};

// Ảnh thật theo từng câu/đáp án, export thủ công từ Figma và đặt vào
// public/images/personal-color/cau-hoi/ (đặt tên đúng cau-{n}-a.jpg / cau-{n}-b.jpg).
// Cho tới khi có ảnh thật, Next/Image sẽ 404 nếu file chưa tồn tại — cần upload đủ 10 ảnh.
const QUESTION_IMAGE_DIR = "/images/personal-color/cau-hoi";
function questionImage(questionNumber: number, option: "a" | "b") {
  const images: Record<string, string> = {
    "1-a": "29.png",
    "1-b": "28.png",
    "2-a": "30.png",
    "2-b": "31.png",
    "3-a": "32.png",
    "3-b": "33.png",
    "4-a": "34.png",
    "4-b": "35.png",
    "5-a": "37.png",
    "5-b": "38.png",
  };

  return `${QUESTION_IMAGE_DIR}/${images[`${questionNumber}-${option}`]}`;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    number: 1,
    text: "Khi quan sát mạch máu ở mặt trong cổ tay dưới ánh sáng tự nhiên, màu nào nổi bật hơn?",
    weight: 2,
    options: [
      { key: "A", text: "Xanh lá hoặc xanh olive", tag: "WARM", image: questionImage(1, "a") },
      { key: "B", text: "Xanh dương hoặc xanh tím", tag: "COOL", image: questionImage(1, "b") },
    ],
  },
  {
    number: 2,
    text: "Sắc màu tự nhiên của làn da bạn thiên về màu nào hơn?",
    weight: 1,
    options: [
      { key: "A", text: "Sắc vàng hoặc vàng beige", tag: "WARM", image: questionImage(2, "a") },
      { key: "B", text: "Sắc hồng hoặc hồng đỏ", tag: "COOL", image: questionImage(2, "b") },
    ],
  },
  {
    number: 3,
    text: "Sau khi ở ngoài nắng trong thời gian dài, làn da của bạn thường chuyển sang màu nào?",
    weight: 1,
    options: [
      { key: "A", text: "Nâu hoặc rám nắng", tag: "WARM", image: questionImage(3, "a") },
      { key: "B", text: "Đỏ hoặc hồng đỏ", tag: "COOL", image: questionImage(3, "b") },
    ],
  },
  {
    number: 4,
    text: "So với mọi người xung quanh, tông da tự nhiên của bạn thuộc nhóm nào?",
    weight: 2,
    options: [
      { key: "A", text: "Tối hoặc ngăm hơn", tag: "DEEP", image: questionImage(4, "a") },
      { key: "B", text: "Sáng hoặc trắng hơn", tag: "LIGHT", image: questionImage(4, "b") },
    ],
  },
  {
    number: 5,
    text: "Màu tóc tự nhiên của bạn gần với nhóm nào hơn?",
    weight: 1,
    options: [
      { key: "A", text: "Nâu sáng hoặc nâu mềm", tag: "LIGHT", image: questionImage(5, "a") },
      { key: "B", text: "Nâu đậm hoặc đen", tag: "DEEP", image: questionImage(5, "b") },
    ],
  },
];

const SEASON_BY_RESULT: Record<Temperature, Record<Value, Season>> = {
  WARM: { LIGHT: "SPRING", DEEP: "AUTUMN" },
  COOL: { LIGHT: "SUMMER", DEEP: "WINTER" },
};

export const SEASON_LABEL: Record<Season, string> = {
  SPRING: "Xuân (Warm + Light)",
  SUMMER: "Hạ (Cool + Light)",
  AUTUMN: "Thu (Warm + Deep)",
  WINTER: "Đông (Cool + Deep)",
};

export type QuizAnswer = {
  questionNumber: number;
  tag: OptionTag;
  weight: number;
};

export type QuizResult = {
  temperature: Temperature;
  value: Value;
  season: Season;
};

// Q1-Q3: tổng điểm Warm tối đa 4 (2+1+1). >=2 → Warm, ngược lại Cool.
// Q4-Q5: tổng điểm Light tối đa 3 (2+1). >=2 → Light, ngược lại Deep.
export function computeQuizResult(answers: QuizAnswer[]): QuizResult {
  const warmScore = answers
    .filter((answer) => answer.questionNumber <= 3 && answer.tag === "WARM")
    .reduce((sum, answer) => sum + answer.weight, 0);

  const lightScore = answers
    .filter((answer) => answer.questionNumber >= 4 && answer.tag === "LIGHT")
    .reduce((sum, answer) => sum + answer.weight, 0);

  const temperature: Temperature = warmScore >= 2 ? "WARM" : "COOL";
  const value: Value = lightScore >= 2 ? "LIGHT" : "DEEP";

  return {
    temperature,
    value,
    season: SEASON_BY_RESULT[temperature][value],
  };
}
