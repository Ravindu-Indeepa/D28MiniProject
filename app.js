/**
 * Youth Cyber Shield LK — University of Ruhuna Development Programme Mini Project Demo
 * Simple, clean client-side interactivity for:
 * 1. Instant Scam Message & Link Checker
 * 2. Quick 4-Question Youth Scam Spotter Quiz
 * 3. SL CERT Helpline Copy & Project Report Modal
 */

(function () {
  "use strict";

  /* ========================================================================
     1. SAMPLE PRESETS & HEURISTIC SCAM MESSAGE CHECKER
     ======================================================================== */
  const SCAM_PRESETS = {
    telegram:
      "Congratulations! You have been selected for part-time online work in Sri Lanka. Earn Rs. 8,000 - 25,000 daily from your phone by liking YouTube & TikTok videos! Instant Rs. 1,500 bonus via Telegram receptionist: https://t.me/sl_vip_task88_bot",
    slpost:
      "SL-POST ALERT: Your parcel #LK904821 is held at Colombo Central Mail Exchange due to an incomplete address. Update delivery details and pay Rs. 98.00 customs fee within 2 hours to avoid return: https://slpost-delivery-check.top/pay",
    whatsapp_otp:
      "Machan hadissi! My mother is in the hospital and my BOC app is locked. I just requested a 6-digit verification code to your phone number by mistake, ikmanata e code eka ewannako. Also can you transfer Rs. 15,000 to this EzCash number?",
    safe_uni:
      "Faculty of Engineering, University of Ruhuna: Semester 1 Examination timetable and lecture hall allocations have been published on the official faculty portal https://www.eng.ruh.ac.lk. Please log in with your student registration number."
  };

  function evaluateMessageHeuristics(rawText) {
    const text = (rawText || "").trim();
    if (!text) {
      return {
        score: 0,
        verdict: "Enter a Message",
        badgeClass: "badge-amber",
        color: "var(--text-muted)",
        summary: "Paste a suspicious message or website link above to check for scam red flags.",
        flags: [{ label: "Waiting for message input", safe: true }]
      };
    }

    let score = 0;
    const flags = [];

    // 1. Part-time task / like & earn scam indicators
    if (/(part[\s-]?time|work from home|online job|like.*youtube|like.*tiktok|vip task|prepaid task|receptionist)/i.test(text)) {
      score += 38;
      flags.push({ label: "Part-Time 'Like & Earn' Task Pattern", safe: false });
    }

    // 2. Unrealistic daily LKR payouts
    if (/(rs\.?\s*\d{1,3}(,\d{3})+|\blkr\s*\d+|earn.*daily|instant.*bonus)/i.test(text)) {
      score += 24;
      flags.push({ label: "Unrealistic Fast Cash Promise (LKR)", safe: false });
    }

    // 3. Telegram bot / untrusted invite handle
    if (/(t\.me\/|telegram|@[a-z0-9_]*bot\b|wa\.me\/)/i.test(text)) {
      score += 22;
      flags.push({ label: "Unverified Telegram / Bot Link", safe: false });
    }

    // 4. Suspicious phishing TLDs (.top, .xyz, .vip, .buzz, .click, bit.ly)
    if (/\.(top|xyz|vip|buzz|click|club|work|loan|gq|tk|ml|cf)(\/|\b)/i.test(text) || /(bit\.ly|tinyurl\.com|cutt\.ly|is\.gd)/i.test(text)) {
      score += 45;
      flags.push({ label: "Fake Phishing Domain (.top / .xyz / Short Link)", safe: false });
    }

    // 5. Parcel / Bank / Telecom impersonation + small fee urgency
    if (/(sl[\s-]?post|parcel|customs fee|incomplete address|dialog|mobitel|daraz|account.*locked|within \d+ hours)/i.test(text)) {
      score += 28;
      flags.push({ label: "Fake Courier / Brand Urgency Trick", safe: false });
    }

    // 6. OTP / 6-digit verification code harvesting or Singlish urgency
    if (/(6[\s-]?digit|verification code|\botp\b|code eka|hadissi|ikmanata|ezcash|hospital)/i.test(text)) {
      score += 42;
      flags.push({ label: "6-Digit OTP / Urgent Money Request", safe: false });
    }

    // 7. Verified Sri Lankan Academic / Government domain check (.ac.lk / .gov.lk)
    const hasOfficialDomain = /\b(ruh\.ac\.lk|eng\.ruh\.ac\.lk|cert\.gov\.lk|cbsl\.gov\.lk|police\.lk)\b/i.test(text);
    if (hasOfficialDomain && score < 25) {
      return {
        score: 4,
        verdict: "Verified Safe",
        badgeClass: "",
        color: "var(--safe-text)",
        summary: "Looks safe! This message uses an official Sri Lankan university or government website (.ac.lk / .gov.lk) and does not ask for OTPs or money.",
        flags: [
          { label: "Official .ac.lk / .gov.lk Website", safe: true },
          { label: "No OTP or Fee Requested", safe: true }
        ]
      };
    }

    score = Math.min(99, Math.max(8, score));

    if (score >= 65) {
      return {
        score,
        verdict: "High Scam Risk",
        badgeClass: "badge-red",
        color: "var(--danger-text)",
        summary: "Danger! This message matches known Sri Lankan social media scam patterns. Do NOT click the link, share any OTP code, or send money.",
        flags
      };
    } else if (score >= 30) {
      return {
        score,
        verdict: "Suspicious Message",
        badgeClass: "badge-amber",
        color: "var(--warning-text)",
        summary: "Caution: This message contains warning signs. Double-check by calling the person or checking the official website directly.",
        flags
      };
    } else {
      return {
        score: 10,
        verdict: "Low Risk",
        badgeClass: "",
        color: "var(--safe-text)",
        summary: "No common scam phrases detected, but always be careful before sharing personal details online.",
        flags: [{ label: "No major scam triggers found", safe: true }]
      };
    }
  }

  function initScamChecker() {
    const input = document.getElementById("scanner-input");
    const scoreEl = document.getElementById("risk-score-number");
    const verdictEl = document.getElementById("risk-verdict-label");
    const summaryEl = document.getElementById("risk-summary-text");
    const flagsContainer = document.getElementById("risk-flags-container");
    const presetButtons = document.querySelectorAll("[data-preset]");

    if (!input) return;

    function runCheck() {
      const result = evaluateMessageHeuristics(input.value);
      if (scoreEl) {
        scoreEl.textContent = `${result.score}/100`;
        scoreEl.style.color = result.color;
      }
      if (verdictEl) {
        verdictEl.textContent = result.verdict;
        verdictEl.className = "score-verdict " + (result.badgeClass || "");
        if (!result.badgeClass) {
          verdictEl.style.backgroundColor = "var(--safe-bg)";
          verdictEl.style.color = "var(--safe-text)";
          verdictEl.style.border = "1px solid var(--safe-border)";
        } else {
          verdictEl.style.backgroundColor = "";
          verdictEl.style.color = "";
          verdictEl.style.border = "";
        }
      }
      if (summaryEl) {
        summaryEl.textContent = result.summary;
      }
      if (flagsContainer) {
        flagsContainer.innerHTML = "";
        result.flags.forEach((f) => {
          const span = document.createElement("span");
          span.className = "flag-tag" + (f.safe ? " safe" : "");
          span.textContent = (f.safe ? "✓ " : "⚠ ") + f.label;
          flagsContainer.appendChild(span);
        });
      }
    }

    presetButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.getAttribute("data-preset");
        if (SCAM_PRESETS[key]) {
          input.value = SCAM_PRESETS[key];
          presetButtons.forEach((b) => b.removeAttribute("data-active"));
          btn.setAttribute("data-active", "");
          runCheck();
        }
      });
    });

    input.addEventListener("input", () => {
      presetButtons.forEach((b) => b.removeAttribute("data-active"));
      runCheck();
    });

    runCheck();
  }

  /* ========================================================================
     2. QUICK 4-QUESTION YOUTH SCAM SPOTTER QUIZ
     ======================================================================== */
  const QUIZ_QUESTIONS = [
    {
      channel: "WHATSAPP DM • FRIEND’S PROFILE PHOTO",
      message:
        "“Hi malli! I accidentally typed your phone number when recovering my Instagram account. Can you forward me the 6-digit SMS code you just received? Hadissi!”",
      correct: "scam",
      explanation:
        "Correct! That 6-digit code is actually the OTP to hijack YOUR account. Your friend's account was already hacked—never share SMS codes."
    },
    {
      channel: "TELEGRAM GROUP • SL PART-TIME VIP TASKS",
      message:
        "“Task 4 (VIP Order): Deposit Rs. 15,000 to our coordinator bank account to unlock Rs. 22,500 instant cashback commission in 10 minutes.”",
      correct: "scam",
      explanation:
        "Correct! This is the classic Telegram 'Prepaid Task' trap. Scammers pay small amounts first, then steal large deposits."
    },
    {
      channel: "OFFICIAL PORTAL • UNIVERSITY OF RUHUNA",
      message:
        "“Notice: Development Programme Mini Project schedules and lecture slides are now available on https://lms.eng.ruh.ac.lk. Log in with your student registration number.”",
      correct: "safe",
      explanation:
        "Correct! This uses the official `eng.ruh.ac.lk` university domain and does not ask for money, card details, or SMS OTP codes."
    },
    {
      channel: "SMS ALERT • SENDER: +62 812 XXXX XXXX",
      message:
        "“Dialog Anniversary Prize! You won Rs. 50,000. Claim before midnight by entering your Debit Card and OTP at https://dialog-lk-win.xyz”",
      correct: "scam",
      explanation:
        "Correct! Sent from a foreign (+62) phone number with a fake `.xyz` website designed to steal your bank card and OTP."
    }
  ];

  function initQuiz() {
    const progressEl = document.getElementById("quiz-progress-label");
    const scoreEl = document.getElementById("quiz-score-badge");
    const channelEl = document.getElementById("quiz-channel-tag");
    const messageEl = document.getElementById("quiz-message-text");
    const feedbackEl = document.getElementById("quiz-feedback-box");
    const choiceBtns = document.querySelectorAll("[data-quiz-answer]");
    const nextBtn = document.getElementById("quiz-next-btn");

    if (!messageEl) return;

    let idx = 0;
    let score = 0;
    let answered = false;

    function renderQuestion() {
      const q = QUIZ_QUESTIONS[idx];
      answered = false;
      if (progressEl) progressEl.textContent = `Question ${idx + 1} of ${QUIZ_QUESTIONS.length}`;
      if (scoreEl) scoreEl.textContent = `Score: ${score} / ${QUIZ_QUESTIONS.length}`;
      if (channelEl) channelEl.textContent = q.channel;
      messageEl.textContent = q.message;

      if (feedbackEl) {
        feedbackEl.textContent = "Choose an answer above to see the explanation from our project report.";
        feedbackEl.style.backgroundColor = "var(--bg-subtle)";
        feedbackEl.style.borderColor = "var(--border-color)";
        feedbackEl.style.color = "var(--text-body)";
      }
    }

    choiceBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (answered) return;
        answered = true;
        const choice = btn.getAttribute("data-quiz-answer");
        const q = QUIZ_QUESTIONS[idx];
        const isCorrect = choice === q.correct;

        if (isCorrect) {
          score += 1;
          if (feedbackEl) {
            feedbackEl.style.backgroundColor = "var(--safe-bg)";
            feedbackEl.style.borderColor = "var(--safe-border)";
            feedbackEl.style.color = "var(--safe-text)";
            feedbackEl.textContent = "✓ " + q.explanation;
          }
        } else {
          if (feedbackEl) {
            feedbackEl.style.backgroundColor = "var(--danger-bg)";
            feedbackEl.style.borderColor = "var(--danger-border)";
            feedbackEl.style.color = "var(--danger-text)";
            feedbackEl.textContent = "✕ Careful! " + q.explanation;
          }
        }

        if (scoreEl) scoreEl.textContent = `Score: ${score} / ${QUIZ_QUESTIONS.length}`;
      });
    });

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        idx = (idx + 1) % QUIZ_QUESTIONS.length;
        if (idx === 0) score = 0;
        renderQuestion();
      });
    }

    renderQuestion();
  }

  /* ========================================================================
     3. COMMUNITY SCAM SHARING & LIVE SOCIETY ALERT BOARD
     ======================================================================== */
  const STORAGE_KEY = "uor_community_scam_alerts_v1";

  const DEFAULT_ALERTS = [
    {
      id: "alert-1",
      reporter: "Nimesh (Undergraduate)",
      district: "Galle",
      platform: "Telegram",
      category: "Part-Time Task / Job Scam",
      identifier: "@sl_youtube_media_vip_bot / +94 74 218 XXXX",
      description:
        "They added me to a group offering Rs. 600 per YouTube screenshot. After paying Rs. 1,200 to my bank account, they asked me to deposit Rs. 15,000 for a 'Prepaid Merchant Task'. Please warn university students not to send any deposit!",
      timeAgo: "2 hours ago",
      confirmations: 28,
      voted: false
    },
    {
      id: "alert-2",
      reporter: "Community Member",
      district: "Matara",
      platform: "SMS / Call",
      category: "Fake Parcel / Bank Link",
      identifier: "https://slpost-customs-lk.top/track",
      description:
        "Received an SMS claiming my Sri Lanka Post parcel cannot be delivered due to an incomplete street address and asking for a Rs. 98.50 fee by debit card. The website looks just like SL Post but ends in .top.",
      timeAgo: "5 hours ago",
      confirmations: 19,
      voted: false
    },
    {
      id: "alert-3",
      reporter: "Dilani (A/L Student)",
      district: "Colombo",
      platform: "WhatsApp",
      category: "6-Digit OTP / Hacked Friend",
      identifier: "Hacked Friend Account ('Ambassador Voting Link')",
      description:
        "A school friend's WhatsApp messaged me asking to vote for her in a brand ambassador contest and asked for the 6-digit SMS code sent to my phone. When I called her directly, she told me her WhatsApp was hacked that morning.",
      timeAgo: "1 day ago",
      confirmations: 34,
      voted: false
    }
  ];

  function loadCommunityAlerts() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      // Fallback to defaults if localStorage is unavailable
    }
    return DEFAULT_ALERTS.slice();
  }

  function saveCommunityAlerts(alerts) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
    } catch (e) {
      // Ignore storage quota errors
    }
  }

  function initCommunityScamBoard() {
    const form = document.getElementById("community-scam-form");
    const listEl = document.getElementById("community-alerts-list");
    const countBadge = document.getElementById("total-alerts-count");
    const filterBtns = document.querySelectorAll("[data-filter-platform]");
    const statusMsg = document.getElementById("community-form-status");

    if (!listEl) return;

    let alerts = loadCommunityAlerts();
    let activeFilter = "all";

    function renderAlerts() {
      const filtered =
        activeFilter === "all"
          ? alerts
          : alerts.filter((a) => a.platform === activeFilter);

      if (countBadge) {
        countBadge.textContent = `${alerts.length} Active Alert${alerts.length === 1 ? "" : "s"}`;
      }

      listEl.innerHTML = "";

      if (filtered.length === 0) {
        const emptyDiv = document.createElement("div");
        emptyDiv.style.padding = "24px";
        emptyDiv.style.textAlign = "center";
        emptyDiv.style.color = "var(--text-muted)";
        emptyDiv.style.fontSize = "14px";
        emptyDiv.textContent = "No scam alerts reported for this platform filter yet.";
        listEl.appendChild(emptyDiv);
        return;
      }

      filtered.forEach((item) => {
        const card = document.createElement("article");
        card.className = "alert-item";

        // Top row: badges & timestamp
        const top = document.createElement("div");
        top.className = "alert-item-top";

        const badges = document.createElement("div");
        badges.className = "alert-badges";

        const platBadge = document.createElement("span");
        platBadge.className = "scam-badge badge-amber";
        platBadge.textContent = item.platform;

        const catBadge = document.createElement("span");
        catBadge.className = "scam-badge badge-red";
        catBadge.textContent = item.category;

        badges.appendChild(platBadge);
        badges.appendChild(catBadge);

        const meta = document.createElement("span");
        meta.className = "alert-meta";
        meta.textContent = `${item.district} • ${item.timeAgo}`;

        top.appendChild(badges);
        top.appendChild(meta);

        // Flagged phone / link / handle box
        const targetBox = document.createElement("div");
        targetBox.className = "alert-target-box";
        targetBox.textContent = `⚠ Reported Contact / Link: ${item.identifier}`;

        // Description
        const desc = document.createElement("p");
        desc.className = "alert-desc";
        desc.textContent = item.description;

        // Footer: reporter + "I saw this too" button
        const footer = document.createElement("div");
        footer.className = "alert-footer";

        const reporterSpan = document.createElement("span");
        reporterSpan.textContent = `Shared by: ${item.reporter}`;

        const voteBtn = document.createElement("button");
        voteBtn.type = "button";
        voteBtn.className = "helpful-btn";
        if (item.voted) voteBtn.setAttribute("data-voted", "true");
        voteBtn.textContent = `👍 I saw this scam too (${item.confirmations || 1})`;

        voteBtn.addEventListener("click", () => {
          if (item.voted) {
            item.voted = false;
            item.confirmations = Math.max(1, (item.confirmations || 1) - 1);
          } else {
            item.voted = true;
            item.confirmations = (item.confirmations || 0) + 1;
          }
          saveCommunityAlerts(alerts);
          renderAlerts();
        });

        footer.appendChild(reporterSpan);
        footer.appendChild(voteBtn);

        card.appendChild(top);
        card.appendChild(targetBox);
        card.appendChild(desc);
        card.appendChild(footer);

        listEl.appendChild(card);
      });
    }

    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        activeFilter = btn.getAttribute("data-filter-platform") || "all";
        filterBtns.forEach((b) => b.removeAttribute("data-active"));
        btn.setAttribute("data-active", "");
        renderAlerts();
      });
    });

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();

        const nameInput = document.getElementById("reporter-name");
        const districtInput = document.getElementById("reporter-district");
        const platformInput = document.getElementById("scam-platform");
        const categoryInput = document.getElementById("scam-category");
        const identifierInput = document.getElementById("scam-identifier");
        const descInput = document.getElementById("scam-description");
        const anonCheckbox = document.getElementById("reporter-anonymous");

        const isAnon = anonCheckbox && anonCheckbox.checked;
        const rawName = nameInput ? nameInput.value.trim() : "";
        const reporter = isAnon || !rawName ? "Community Member" : rawName;
        const district = districtInput ? districtInput.value : "Sri Lanka";
        const platform = platformInput ? platformInput.value : "WhatsApp";
        const category = categoryInput ? categoryInput.value : "Social Media Scam";
        const identifier = identifierInput ? identifierInput.value.trim() : "Unverified Sender";
        const description = descInput ? descInput.value.trim() : "";

        if (!identifier || !description) return;

        const newAlert = {
          id: "alert-" + Date.now(),
          reporter,
          district,
          platform,
          category,
          identifier,
          description,
          timeAgo: "Just now",
          confirmations: 1,
          voted: true
        };

        alerts.unshift(newAlert);
        saveCommunityAlerts(alerts);

        // Reset filter to "all" so user immediately sees their new alert at the top
        activeFilter = "all";
        filterBtns.forEach((b) => {
          if (b.getAttribute("data-filter-platform") === "all") {
            b.setAttribute("data-active", "");
          } else {
            b.removeAttribute("data-active");
          }
        });

        renderAlerts();
        form.reset();

        if (statusMsg) {
          statusMsg.setAttribute("data-visible", "true");
          setTimeout(() => {
            statusMsg.removeAttribute("data-visible");
          }, 5000);
        }
      });
    }

    renderAlerts();
  }

  /* ========================================================================
     4. HELPLINE COPY & PROJECT REPORT MODAL
     ======================================================================== */
  function initModalAndCopy() {
    // Copy button handlers for any element with [data-copy]
    const copyBtns = document.querySelectorAll("[data-copy]");
    copyBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const text = btn.getAttribute("data-copy") || "+94 11 269 1692";
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).catch(() => {});
        }
        const orig = btn.textContent;
        btn.textContent = "Copied!";
        setTimeout(() => {
          btn.textContent = orig;
        }, 2000);
      });
    });

    // 1. Report Modal
    const reportModal = document.getElementById("report-modal");
    const openReportBtns = document.querySelectorAll("[data-open-report]");
    const closeReportBtn = document.getElementById("close-report-modal");
    const tryScannerBtn = document.getElementById("modal-try-scanner-btn");

    if (reportModal) {
      function openReport() {
        reportModal.setAttribute("data-open", "true");
      }
      function closeReport() {
        reportModal.removeAttribute("data-open");
      }

      openReportBtns.forEach((btn) => btn.addEventListener("click", openReport));
      if (closeReportBtn) closeReportBtn.addEventListener("click", closeReport);

      if (tryScannerBtn) {
        tryScannerBtn.addEventListener("click", () => {
          closeReport();
          const checkerEl = document.getElementById("checker");
          if (checkerEl) {
            checkerEl.scrollIntoView({ behavior: "smooth" });
          } else {
            window.location.href = "learn-scams.html#checker";
          }
        });
      }

      reportModal.addEventListener("click", (e) => {
        if (e.target === reportModal) closeReport();
      });
    }

    // 2. Helpline Emergency Modal (Where to Report Scams in Sri Lanka)
    const helplineModal = document.getElementById("helpline-modal");
    const openHelplineBtns = document.querySelectorAll("[data-open-helpline]");
    const closeHelplineBtn = document.getElementById("close-helpline-modal");

    if (helplineModal) {
      function openHelpline() {
        helplineModal.setAttribute("data-open", "true");
      }
      function closeHelpline() {
        helplineModal.removeAttribute("data-open");
      }

      openHelplineBtns.forEach((btn) => btn.addEventListener("click", openHelpline));
      if (closeHelplineBtn) closeHelplineBtn.addEventListener("click", closeHelpline);

      helplineModal.addEventListener("click", (e) => {
        if (e.target === helplineModal) closeHelpline();
      });
    }

    // Global ESC key to close any open modal
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (reportModal && reportModal.getAttribute("data-open") === "true") {
          reportModal.removeAttribute("data-open");
        }
        if (helplineModal && helplineModal.getAttribute("data-open") === "true") {
          helplineModal.removeAttribute("data-open");
        }
      }
    });
  }

  /* ========================================================================
     5. SCROLL-REVEAL & STAGGERED CARD ANIMATIONS
     ======================================================================== */
  function initScrollAnimations() {
    const targets = document.querySelectorAll(
      ".section-header, .scam-card, .checker-card, .step-card, .quiz-card, .report-form-card, .alerts-feed-card, .report-box, .helpline-box"
    );
    if (!targets.length || !("IntersectionObserver" in window)) return;

    targets.forEach((el, index) => {
      el.classList.add("reveal-on-scroll");
      el.style.transitionDelay = `${(index % 4) * 70}ms`;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    targets.forEach((el) => observer.observe(el));
  }

  /* ========================================================================
     6. BLURRED ANIMATED HACKER / CYBER-SCAM BANNER CANVAS
     ======================================================================== */
  function initCyberHackerBackgroundCanvas() {
    const heroBanner = document.querySelector(".hero-section:not(.hero-static)");
    if (!heroBanner) return;

    const canvas = document.createElement("canvas");
    canvas.className = "cyber-bg-canvas";
    canvas.setAttribute("aria-hidden", "true");
    heroBanner.prepend(canvas);

    const ctx = canvas.getContext("2d");
    let w = (canvas.width = heroBanner.offsetWidth || window.innerWidth);
    let h = (canvas.height = heroBanner.offsetHeight || 520);

    function updateDimensions() {
      w = canvas.width = heroBanner.offsetWidth || window.innerWidth;
      h = canvas.height = heroBanner.offsetHeight || 520;
    }

    window.addEventListener("resize", updateDimensions, { passive: true });
    setTimeout(updateDimensions, 100);
    setTimeout(updateDimensions, 500);

    const isMobile = window.innerWidth <= 860;
    const nodeCount = isMobile ? 12 : 24;
    const maxDist = isMobile ? 130 : 220;

    // Floating cyber/scam symbols (locks, shields, binary packets, warning nodes)
    const nodes = Array.from({ length: nodeCount }, (_, i) => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * (isMobile ? 0.45 : 0.75),
      vy: (Math.random() - 0.5) * (isMobile ? 0.4 : 0.65) - (isMobile ? 0.08 : 0.18),
      radius: isMobile ? 11 + Math.random() * 9 : 16 + Math.random() * 20,
      type: i % 4, // 0: lock, 1: warning triangle, 2: binary stream, 3: shield node
      hue: [190, 345, 155, 215][i % 4],
      phase: Math.random() * Math.PI * 2
    }));

    function drawPadlock(x, y, r, color) {
      ctx.strokeStyle = color;
      ctx.lineWidth = isMobile ? 1.5 : 2;
      ctx.strokeRect(x - r * 0.45, y - r * 0.1, r * 0.9, r * 0.75);
      ctx.beginPath();
      ctx.arc(x, y - r * 0.1, r * 0.3, Math.PI, 0, false);
      ctx.stroke();
    }

    function drawWarningTriangle(x, y, r, color) {
      ctx.strokeStyle = color;
      ctx.lineWidth = isMobile ? 1.5 : 2;
      ctx.beginPath();
      ctx.moveTo(x, y - r * 0.6);
      ctx.lineTo(x + r * 0.6, y + r * 0.5);
      ctx.lineTo(x - r * 0.6, y + r * 0.5);
      ctx.closePath();
      ctx.stroke();
    }

    function drawShield(x, y, r, color) {
      ctx.strokeStyle = color;
      ctx.lineWidth = isMobile ? 1.5 : 2;
      ctx.beginPath();
      ctx.moveTo(x, y - r * 0.65);
      ctx.lineTo(x + r * 0.55, y - r * 0.35);
      ctx.quadraticCurveTo(x + r * 0.5, y + r * 0.45, x, y + r * 0.7);
      ctx.quadraticCurveTo(x - r * 0.5, y + r * 0.45, x - r * 0.55, y - r * 0.35);
      ctx.closePath();
      ctx.stroke();
    }

    function animate() {
      ctx.clearRect(0, 0, w, h);

      // Connect nearby cyber nodes with glowing network lines
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * (isMobile ? 0.22 : 0.28);
            ctx.strokeStyle = `rgba(56, 189, 248, ${alpha.toFixed(3)})`;
            ctx.lineWidth = isMobile ? 1 : 1.2;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        n.phase += 0.025;

        if (n.x < -50) n.x = w + 50;
        if (n.x > w + 50) n.x = -50;
        if (n.y < -50) n.y = h + 50;
        if (n.y > h + 50) n.y = -50;

        const alpha = 0.34 + Math.sin(n.phase) * 0.12;
        const color = `hsla(${n.hue}, 92%, 62%, ${alpha.toFixed(3)})`;

        // Soft glowing aura
        const grad = ctx.createRadialGradient(n.x, n.y, 2, n.x, n.y, n.radius * 2.2);
        grad.addColorStop(0, `hsla(${n.hue}, 95%, 60%, ${(alpha * 0.7).toFixed(3)})`);
        grad.addColorStop(1, `hsla(${n.hue}, 95%, 60%, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius * 2.2, 0, Math.PI * 2);
        ctx.fill();

        if (n.type === 0) {
          drawPadlock(n.x, n.y, n.radius, color);
        } else if (n.type === 1) {
          drawWarningTriangle(n.x, n.y, n.radius, color);
        } else if (n.type === 2) {
          ctx.fillStyle = color;
          ctx.font = "bold 13px monospace";
          ctx.fillText("0101 // SCAM", n.x - 36, n.y);
        } else {
          drawShield(n.x, n.y, n.radius, color);
        }
      });

      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }

  /* ========================================================================
     7. ANIMATED HERO PIE CHARTS (73%, 68%, 81%)
     ======================================================================== */
  function initHeroPieCharts() {
    const statItems = document.querySelectorAll(".stat-item[data-pie-target]");
    if (!statItems.length) return;

    function animatePieItem(item, delayMs) {
      const target = parseInt(item.getAttribute("data-pie-target") || "0", 10);
      const wedge = item.querySelector(".stat-pie-wedge");
      const ring = item.querySelector(".stat-pie-ring");
      const numEl = item.querySelector(".stat-pie-num");

      // Reset to 0 first
      if (wedge) wedge.setAttribute("stroke-dasharray", "0 100");
      if (ring) ring.setAttribute("stroke-dasharray", "0 100");
      if (numEl) numEl.textContent = "0%";

      setTimeout(() => {
        // Fill inner pie wedge (circumference = 50 for r=7.9577) & outer ring (circumference = 100 for r=15.9155)
        if (wedge) wedge.setAttribute("stroke-dasharray", `${(target * 0.5).toFixed(2)} 100`);
        if (ring) ring.setAttribute("stroke-dasharray", `${target} 100`);

        // Animate number counter from 0% to target%
        const duration = 1400;
        const start = performance.now();
        function stepCounter(now) {
          const elapsed = now - start;
          const progress = Math.min(1, elapsed / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          const currentVal = Math.round(eased * target);
          if (numEl) numEl.textContent = `${currentVal}%`;
          if (progress < 1) {
            requestAnimationFrame(stepCounter);
          }
        }
        requestAnimationFrame(stepCounter);
      }, delayMs);
    }

    statItems.forEach((item, idx) => {
      animatePieItem(item, 220 + idx * 180);
      item.addEventListener("mouseenter", () => animatePieItem(item, 40));
    });
  }

  /* ========================================================================
     8. INTERACTIVE TABS CONTROLLER (FOR MULTI-PAGE & HUB TABS)
     ======================================================================== */
  function initPageTabs() {
    const tabBtns = document.querySelectorAll(".tab-btn[data-target-tab]");
    if (!tabBtns.length) return;

    function activateTab(targetId) {
      const targetPane = document.getElementById(targetId);
      if (!targetPane) return;

      tabBtns.forEach((btn) => {
        if (btn.getAttribute("data-target-tab") === targetId) {
          btn.classList.add("active");
          btn.setAttribute("aria-selected", "true");
        } else {
          btn.classList.remove("active");
          btn.setAttribute("aria-selected", "false");
        }
      });

      document.querySelectorAll(".tab-pane").forEach((pane) => {
        if (pane.id === targetId) {
          pane.classList.add("active");
        } else {
          pane.classList.remove("active");
        }
      });
    }

    tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetId = btn.getAttribute("data-target-tab");
        activateTab(targetId);
        // Optionally update URL hash without scrolling
        if (history.replaceState) {
          history.replaceState(null, null, "#" + targetId);
        }
      });
    });

    // Support URL hash directly (e.g. #tab-community or #tab-scams)
    if (window.location.hash) {
      const hashId = window.location.hash.substring(1);
      const matchingBtn = document.querySelector(`.tab-btn[data-target-tab="${hashId}"]`);
      if (matchingBtn) {
        activateTab(hashId);
      }
    }
  }

  /* ========================================================================
     9. ANIMATED COMMUNITY NETWORK & CITIZEN WATCH CANVAS
     ======================================================================== */
  function initCommunityNetworkCanvas() {
    const canvas = document.getElementById("community-network-canvas");
    if (!canvas) return;

    const banner = canvas.parentElement;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = banner.offsetWidth || window.innerWidth);
    let h = (canvas.height = banner.offsetHeight || 520);

    window.addEventListener(
      "resize",
      () => {
        w = canvas.width = banner.offsetWidth || window.innerWidth;
        h = canvas.height = banner.offsetHeight || 520;
      },
      { passive: true }
    );

    // Sri Lankan Community Hub & Citizen Node labels
    const communityLabels = [
      "Galle Hub",
      "Colombo Watch",
      "Kandy Alert",
      "Matara Youth",
      "Kurunegala",
      "Jaffna Shield",
      "Gampaha",
      "Hambantota",
      "Univ. Ruhuna",
      "Youth Watch",
      "Citizen Node",
      "School Network",
      "SL CERT Alert"
    ];

    const nodesCount = Math.min(26, Math.max(14, Math.floor(w / 45)));
    const nodes = Array.from({ length: nodesCount }, (_, i) => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.7,
      vy: (Math.random() - 0.5) * 0.55,
      radius: Math.random() * 2.8 + 2.2,
      label: i < communityLabels.length ? communityLabels[i] : null,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.03 + Math.random() * 0.02,
      color: i % 3 === 0 ? "#38bdf8" : i % 3 === 1 ? "#34d399" : "#818cf8"
    }));

    // Occasional broadcast ripple wave
    let ripples = [];
    function triggerRandomRipple() {
      if (nodes.length > 0 && Math.random() < 0.025) {
        const source = nodes[Math.floor(Math.random() * nodes.length)];
        ripples.push({
          x: source.x,
          y: source.y,
          r: 0,
          maxR: 90 + Math.random() * 60,
          alpha: 0.7,
          color: source.color
        });
      }
    }

    function animate() {
      ctx.clearRect(0, 0, w, h);

      triggerRandomRipple();

      // Render ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rip = ripples[i];
        rip.r += 1.4;
        rip.alpha -= 0.012;
        if (rip.alpha <= 0 || rip.r >= rip.maxR) {
          ripples.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.r, 0, Math.PI * 2);
        ctx.strokeStyle = rip.color;
        ctx.globalAlpha = rip.alpha * 0.45;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      }

      // Draw connecting lines between nearby community nodes
      const maxDist = 135;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.hypot(dx, dy);

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.28;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
            ctx.lineWidth = 1.1;
            ctx.stroke();
          }
        }
      }

      // Render each node
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0) n.x = w;
        if (n.x > w) n.x = 0;
        if (n.y < 0) n.y = h;
        if (n.y > h) n.y = 0;

        n.pulse += n.pulseSpeed;
        const currentR = n.radius + Math.sin(n.pulse) * 1.2;

        // Glowing outer halo
        ctx.beginPath();
        ctx.arc(n.x, n.y, currentR * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.globalAlpha = 0.12;
        ctx.fill();

        // Node center
        ctx.beginPath();
        ctx.arc(n.x, n.y, currentR, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.globalAlpha = 0.85;
        ctx.fill();
        ctx.globalAlpha = 1;

        // Node badge label for district hubs
        if (n.label && w > 640) {
          ctx.save();
          ctx.font = "10px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
          ctx.fillStyle = "rgba(226, 232, 240, 0.75)";
          ctx.fillText(n.label, n.x + 8, n.y + 3);
          ctx.restore();
        }
      }

      requestAnimationFrame(animate);
    }

    animate();
  }

  /* ==========================================================================
     10. ANIMATED LEARNING ACADEMY SYNAPSE & DEFENSE LAB CANVAS
     ======================================================================== */
  function initLearningAcademyCanvas() {
    const canvas = document.getElementById("learning-academy-canvas");
    if (!canvas) return;

    const banner = canvas.parentElement;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = banner.offsetWidth || window.innerWidth);
    let h = (canvas.height = banner.offsetHeight || 520);

    window.addEventListener(
      "resize",
      () => {
        w = canvas.width = banner.offsetWidth || window.innerWidth;
        h = canvas.height = banner.offsetHeight || 520;
      },
      { passive: true }
    );

    // Mouse tracking for interactive knowledge beacon
    let mouse = { x: -9999, y: -9999, active: false };
    banner.addEventListener(
      "mousemove",
      (e) => {
        const rect = banner.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        mouse.active = true;
      },
      { passive: true }
    );
    banner.addEventListener(
      "mouseleave",
      () => {
        mouse.active = false;
        mouse.x = -9999;
        mouse.y = -9999;
      },
      { passive: true }
    );

    // Key Learning Concepts & Module Nodes
    const conceptNodes = [
      { label: "🎓 Academy Core", color: "#818cf8", isKey: true },
      { label: "🧪 Heuristic Lab", color: "#38bdf8", isKey: true },
      { label: "🛡️ 3 Safety Rules", color: "#34d399", isKey: true },
      { label: "🏆 Spotter Quiz", color: "#facc15", isKey: true },
      { label: "⚡ OTP Safeguard", color: "#f43f5e", isKey: false },
      { label: "🔍 .lk Domain Guard", color: "#38bdf8", isKey: false },
      { label: "💡 Job Scam Defense", color: "#a855f7", isKey: false },
      { label: "🚨 CERT 1692", color: "#f97316", isKey: false },
      { label: "📊 Risk Analyzer", color: "#60a5fa", isKey: false },
      { label: "🧠 Defense Heuristics", color: "#818cf8", isKey: false },
      { label: "🔒 Account Integrity", color: "#2dd4bf", isKey: false },
      { label: "👥 Student Shield", color: "#a78bfa", isKey: false },
      { label: "✓ Zero Trust DM", color: "#4ade80", isKey: false },
      { label: "📱 WhatsApp Watch", color: "#22c55e", isKey: false }
    ];

    const nodesCount = Math.min(22, Math.max(14, Math.floor(w / 55)));
    const nodes = Array.from({ length: nodesCount }, (_, i) => {
      const concept = conceptNodes[i % conceptNodes.length];
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.4,
        radius: concept.isKey ? 5.5 : 3.8,
        label: i < 9 ? concept.label : null,
        isKey: concept.isKey,
        color: concept.color,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.025 + Math.random() * 0.02,
        orbitAngle: Math.random() * Math.PI * 2,
        orbitSpeed: 0.015 + Math.random() * 0.01
      };
    });

    // Learning Data Packets traveling along synaptic lines
    const packets = [];
    function spawnPacket(fromNode, toNode) {
      if (packets.length >= 10) return;
      packets.push({
        from: fromNode,
        to: toNode,
        progress: 0,
        speed: 0.008 + Math.random() * 0.01,
        color: fromNode.color
      });
    }

    // Floating Cyber Formulas / Micro-Rules
    const formulaTexts = [
      "OTP ≠ Share",
      "Verify .lk Domain",
      "No Advance Fee",
      "Risk Score: 0%",
      "Heuristic: PASS",
      "3-Second Rule",
      "SL CERT: 1692",
      "Zero Trust DMs"
    ];

    const formulaParticles = formulaTexts.map((text, i) => ({
      text: text,
      x: (w / formulaTexts.length) * i + Math.random() * 30,
      y: Math.random() * h,
      vy: -(0.25 + Math.random() * 0.3),
      vx: (Math.random() - 0.5) * 0.15,
      alpha: 0.22 + Math.random() * 0.18
    }));

    function animate() {
      ctx.clearRect(0, 0, w, h);

      // 1. Render Floating Micro-Formulas
      ctx.font = "11px monospace";
      ctx.textAlign = "center";
      for (let i = 0; i < formulaParticles.length; i++) {
        const fp = formulaParticles[i];
        fp.y += fp.vy;
        fp.x += fp.vx;
        if (fp.y < -20) {
          fp.y = h + 20;
          fp.x = Math.random() * w;
        }
        if (fp.x < 0) fp.x = w;
        if (fp.x > w) fp.x = 0;

        ctx.fillStyle = `rgba(165, 180, 252, ${fp.alpha})`;
        ctx.fillText(fp.text, fp.x, fp.y);
      }

      // 2. Update & Draw Nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        n.pulse += n.pulseSpeed;
        n.orbitAngle += n.orbitSpeed;

        if (n.x < 15 || n.x > w - 15) n.vx *= -1;
        if (n.y < 15 || n.y > h - 15) n.vy *= -1;

        // Interactive mouse beacon ray
        if (mouse.active) {
          const dx = n.x - mouse.x;
          const dy = n.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 120 && dist > 0) {
            const force = (120 - dist) / 120;
            n.x += (dx / dist) * force * 1.1;
            n.y += (dy / dist) * force * 1.1;

            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(n.x, n.y);
            ctx.strokeStyle = `rgba(129, 140, 248, ${0.4 * force})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
        }
      }

      // 3. Draw Synaptic Knowledge Connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);

          if (dist < 135) {
            const alpha = (1 - dist / 135) * 0.32;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(129, 140, 248, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();

            if (Math.random() < 0.003) {
              spawnPacket(a, b);
            }
          }
        }
      }

      // 4. Update & Draw Knowledge Packets
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i];
        p.progress += p.speed;
        if (p.progress >= 1) {
          packets.splice(i, 1);
          continue;
        }

        const px = p.from.x + (p.to.x - p.from.x) * p.progress;
        const py = p.from.y + (p.to.y - p.from.y) * p.progress;

        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 5. Draw Node Glows, Rings, & Labels
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const pulseR = n.radius + Math.sin(n.pulse) * 1.5;

        // Orbital Ring for Key Modules
        if (n.isKey) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius + 10, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(129, 140, 248, 0.28)`;
          ctx.setLineDash([3, 4]);
          ctx.lineWidth = 1;
          ctx.stroke();

          // Orbiting satellite dot
          const satX = n.x + Math.cos(n.orbitAngle) * (n.radius + 10);
          const satY = n.y + Math.sin(n.orbitAngle) * (n.radius + 10);
          ctx.beginPath();
          ctx.arc(satX, satY, 2, 0, Math.PI * 2);
          ctx.fillStyle = "#ffffff";
          ctx.fill();
          ctx.restore();
        }

        // Inner glowing core
        ctx.beginPath();
        ctx.arc(n.x, n.y, pulseR, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.shadowColor = n.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label if present
        if (n.label && w > 640) {
          ctx.font = "10.5px 'Inter', sans-serif";
          ctx.fillStyle = "rgba(226, 232, 240, 0.85)";
          ctx.textAlign = "center";
          ctx.fillText(n.label, n.x, n.y + pulseR + 13);
        }
      }

      requestAnimationFrame(animate);
    }

    animate();
  }

  /* ==========================================================================
     11. ANIMATED LIVE LEARNING TICKER
     ======================================================================== */
  function initLearningBannerTicker() {
    const tickerEl = document.getElementById("learning-live-ticker");
    if (!tickerEl) return;

    const phrases = [
      "🎓 Interactive Learning Lab • Youth Cyber Defense Academy",
      "🧪 Module 1: Heuristic Message Scanner • Test Suspicious SMS & Links",
      "🛡️ Module 2: 3 Simple Safety Protocols • Prevent 95% of Social Scams",
      "🏆 Module 3: Youth Spotter Quiz • Test Your Cyber Reflexes",
      "⚡ Real-Time Heuristic Rules • Calibrated for Sri Lankan Social Platforms",
      "📚 Self-Paced Cyber Curriculum • Faculty of Engineering, Univ. of Ruhuna"
    ];

    let currentIndex = 0;
    setInterval(() => {
      tickerEl.style.opacity = "0";
      tickerEl.style.transform = "translateY(-4px)";
      setTimeout(() => {
        currentIndex = (currentIndex + 1) % phrases.length;
        tickerEl.textContent = phrases[currentIndex];
        tickerEl.style.opacity = "1";
        tickerEl.style.transform = "translateY(0)";
      }, 300);
    }, 3800);
  }

  /* ==========================================================================
     12. MOBILE NAVIGATION DRAWER & TOUCH CONTROLS
     ======================================================================== */
  function initMobileNav() {
    const toggleBtn = document.getElementById("mobile-menu-toggle");
    const drawer = document.getElementById("mobile-nav-drawer");
    if (!toggleBtn || !drawer) return;

    function openDrawer() {
      drawer.classList.add("active");
      toggleBtn.classList.add("active");
      toggleBtn.setAttribute("aria-expanded", "true");
    }

    function closeDrawer() {
      drawer.classList.remove("active");
      toggleBtn.classList.remove("active");
      toggleBtn.setAttribute("aria-expanded", "false");
    }

    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (drawer.classList.contains("active")) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });

    // Close when tapping links or buttons inside the drawer
    drawer.querySelectorAll("a, button").forEach((item) => {
      item.addEventListener("click", () => {
        closeDrawer();
      });
    });

    // Close when tapping outside the drawer
    document.addEventListener("click", (e) => {
      if (
        drawer.classList.contains("active") &&
        !drawer.contains(e.target) &&
        !toggleBtn.contains(e.target)
      ) {
        closeDrawer();
      }
    });

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && drawer.classList.contains("active")) {
        closeDrawer();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initCyberHackerBackgroundCanvas();
    initCommunityNetworkCanvas();
    initLearningAcademyCanvas();
    initLearningBannerTicker();
    initHeroPieCharts();
    initScamChecker();
    initQuiz();
    initCommunityScamBoard();
    initModalAndCopy();
    initScrollAnimations();
    initPageTabs();
    initMobileNav();
  });
})();
