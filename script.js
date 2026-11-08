// ===== 問題データ =====
// answer は choices の正解インデックス（0始まり）
const questions = [
  {
    question: "日本で最も面積が大きい湖はどれ？",
    choices: ["霞ヶ浦", "猪苗代湖", "琵琶湖", "サロマ湖"],
    answer: 2,
    explanation: "滋賀県にある琵琶湖は、面積約670km²で日本最大の湖です。"
  },
  {
    question: "富士山の標高として正しいものはどれ？",
    choices: ["2,776m", "3,776m", "4,776m", "3,376m"],
    answer: 1,
    explanation: "富士山の標高は3,776mで、日本で最も高い山です。"
  },
  {
    question: "太陽系で最も大きい惑星はどれ？",
    choices: ["土星", "地球", "海王星", "木星"],
    answer: 3,
    explanation: "木星は直径が地球の約11倍もある、太陽系最大の惑星です。"
  },
  {
    question: "1気圧のもとで、水が沸騰する温度はおよそ何℃？",
    choices: ["100℃", "80℃", "120℃", "90℃"],
    answer: 0,
    explanation: "1気圧では、水はおよそ100℃で沸騰します。"
  },
  {
    question: "うるう年の2月は何日まである？",
    choices: ["28日", "30日", "29日", "31日"],
    answer: 2,
    explanation: "通常の2月は28日まで、うるう年は29日まであります。"
  },
  {
    question: "日本の都道府県の数はいくつ？",
    choices: ["43", "45", "47", "49"],
    answer: 2,
    explanation: "日本は1都1道2府43県で、合わせて47都道府県です。"
  },
  {
    question: "1時間は何秒？",
    choices: ["360秒", "3,600秒", "6,000秒", "36,000秒"],
    answer: 1,
    explanation: "1時間は60分、1分は60秒なので、60×60＝3,600秒です。"
  },
  {
    question: "光の三原色に含まれない色はどれ？",
    choices: ["赤", "緑", "青", "黄"],
    answer: 3,
    explanation: "光の三原色は赤・緑・青（RGB）です。黄は色の三原色（シアン・マゼンタ・イエロー）のひとつです。"
  },
  {
    question: "夏季オリンピックは原則として何年ごとに開催される？",
    choices: ["4年", "2年", "3年", "5年"],
    answer: 0,
    explanation: "夏季オリンピックは原則4年ごとに開催されます。"
  },
  {
    question: "日本の国鳥はどれ？",
    choices: ["タンチョウ", "トキ", "スズメ", "キジ"],
    answer: 3,
    explanation: "1947年に日本鳥学会がキジを国鳥に選定しました。"
  }
];

// ===== 画面制御 =====
(() => {
  const startScreen = document.querySelector("#start-screen");
  const quizScreen = document.querySelector("#quiz-screen");
  const resultScreen = document.querySelector("#result-screen");

  const progressEl = document.querySelector("#progress");
  const questionEl = document.querySelector("#question-text");
  const choicesEl = document.querySelector("#choices");
  const feedbackEl = document.querySelector("#feedback");
  const nextButton = document.querySelector("#next-button");
  const scoreEl = document.querySelector("#score-text");
  const messageEl = document.querySelector("#result-message");
  const timerTrack = document.querySelector(".timer-track");
  const timerBar = document.querySelector("#timer-bar");
  const timerText = document.querySelector("#timer-text");

  const TIME_LIMIT = 20; // 1問あたりの制限時間（秒）

  let currentIndex = 0;
  let score = 0;
  let timerId = null;
  let deadline = 0;

  // 残り時間に合わせてバーと表示を更新する
  const updateTimer = (remainingMs) => {
    const ratio = Math.max(remainingMs, 0) / (TIME_LIMIT * 1000);
    const seconds = Math.ceil(Math.max(remainingMs, 0) / 1000);

    timerBar.style.width = `${ratio * 100}%`;
    timerBar.classList.toggle("is-warning", ratio <= 0.5 && ratio > 0.25);
    timerBar.classList.toggle("is-danger", ratio <= 0.25);
    timerText.classList.toggle("is-danger", ratio <= 0.25);
    timerText.textContent = `残り ${seconds} 秒`;
    timerTrack.setAttribute("aria-valuenow", seconds);
  };

  const stopTimer = () => {
    clearInterval(timerId);
    timerId = null;
  };

  const startTimer = () => {
    stopTimer();
    deadline = Date.now() + TIME_LIMIT * 1000;
    updateTimer(TIME_LIMIT * 1000);

    timerId = setInterval(() => {
      const remaining = deadline - Date.now();
      updateTimer(remaining);
      if (remaining <= 0) {
        checkAnswer(null); // 時間切れ
      }
    }, 100);
  };

  // 指定した画面だけを表示する
  const showScreen = (screen) => {
    [startScreen, quizScreen, resultScreen].forEach((el) => {
      el.hidden = el !== screen;
    });
  };

  const startQuiz = () => {
    currentIndex = 0;
    score = 0;
    showScreen(quizScreen);
    renderQuestion();
  };

  const renderQuestion = () => {
    const q = questions[currentIndex];

    progressEl.textContent = `第${currentIndex + 1}問 / 全${questions.length}問`;
    questionEl.textContent = q.question;
    feedbackEl.textContent = "";
    feedbackEl.className = "feedback";
    nextButton.hidden = true;

    choicesEl.innerHTML = "";
    q.choices.forEach((choice, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "choice-button";
      button.textContent = `${index + 1}. ${choice}`;
      button.addEventListener("click", () => checkAnswer(index));
      choicesEl.appendChild(button);
    });

    choicesEl.querySelector("button").focus();
    startTimer();
  };

  // selectedIndex が null のときは時間切れ
  const checkAnswer = (selectedIndex) => {
    stopTimer();

    const q = questions[currentIndex];
    const buttons = choicesEl.querySelectorAll("button");
    const isTimeUp = selectedIndex === null;
    const isCorrect = selectedIndex === q.answer;

    // 回答後は選択肢を押せないようにする
    buttons.forEach((button) => {
      button.disabled = true;
    });
    buttons[q.answer].classList.add("is-correct");

    if (isCorrect) {
      score++;
      feedbackEl.textContent = "⭕ 正解！";
      feedbackEl.classList.add("is-correct");
    } else if (isTimeUp) {
      feedbackEl.textContent = `⏰ 時間切れ！ 正解は「${q.choices[q.answer]}」です。`;
      feedbackEl.classList.add("is-wrong");
    } else {
      buttons[selectedIndex].classList.add("is-wrong");
      feedbackEl.textContent = `❌ 不正解… 正解は「${q.choices[q.answer]}」です。`;
      feedbackEl.classList.add("is-wrong");
    }

    if (q.explanation) {
      const explanation = document.createElement("span");
      explanation.className = "explanation";
      explanation.textContent = q.explanation;
      feedbackEl.appendChild(explanation);
    }

    const isLast = currentIndex === questions.length - 1;
    nextButton.textContent = isLast ? "結果を見る" : "次の問題へ";
    nextButton.hidden = false;
    nextButton.focus();
  };

  const showResult = () => {
    const total = questions.length;
    scoreEl.textContent = `${total}問中${score}問正解`;

    let message;
    if (score === total) {
      message = "全問正解！素晴らしいです！";
    } else if (score >= total * 0.6) {
      message = "よくできました！あと少しで満点です。";
    } else {
      message = "もう一度挑戦してみましょう！";
    }
    messageEl.textContent = message;

    showScreen(resultScreen);
    document.querySelector("#retry-button").focus();
  };

  document.querySelector("#start-button").addEventListener("click", startQuiz);
  document.querySelector("#retry-button").addEventListener("click", startQuiz);
  nextButton.addEventListener("click", () => {
    currentIndex++;
    if (currentIndex < questions.length) {
      renderQuestion();
    } else {
      showResult();
    }
  });
})();
