/* 2026 校园星光音乐节 · 报名宣传 H5
   功能：分支跳转 / 弹窗交互 / 音频控制 / 表单闭环（无第三方依赖） */
(function () {
  "use strict";

  /* ========== 舞台等比缩放（640×1136） ========== */
  var stage = document.getElementById("stage");
  function fitStage() {
    var scale = Math.min(window.innerWidth / 640, window.innerHeight / 1136);
    stage.style.transform = "scale(" + scale + ")";
  }
  window.addEventListener("resize", fitStage);
  fitStage();

  /* ========== 功能一：分支跳转 ========== */
  var pages = Array.prototype.slice.call(document.querySelectorAll(".page"));
  function goPage(id) {
    pages.forEach(function (p) { p.classList.toggle("active", p.id === id); });
    var target = document.getElementById(id);
    if (target) target.scrollTop = 0;
    closeAllPopups();
  }
  document.querySelectorAll("[data-go]").forEach(function (btn) {
    btn.addEventListener("click", function () { goPage(btn.getAttribute("data-go")); });
  });

  /* ========== 功能二：弹窗交互 ========== */
  function closeAllPopups() {
    document.querySelectorAll(".popup-mask.open").forEach(function (m) {
      m.classList.remove("open");
    });
  }
  document.querySelectorAll("[data-popup]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-popup");
      if (id === "popupArtist") fillArtist(Number(btn.getAttribute("data-artist")));
      document.getElementById(id).classList.add("open");
    });
  });
  document.querySelectorAll("[data-close]").forEach(function (btn) {
    btn.addEventListener("click", closeAllPopups);
  });
  document.querySelectorAll(".popup-mask").forEach(function (mask) {
    mask.addEventListener("click", function (e) {
      if (e.target === mask) closeAllPopups(); // 点遮罩也可关闭
    });
  });

  /* 嘉宾数据：弹窗复用，按卡片索引填充 */
  var ARTISTS = [
    { name: "逆时针乐队", tag: "流行摇滚 · 压轴出场", ch: "逆",
      desc: "由本校大四学生组成的五人乐队，成立三年，原创作品《晚风站台》在校园原创音乐大赛获一等奖。本次将带来 40 分钟压轴演出，包含三首未公开新歌。" },
    { name: "蓝鲸合唱团", tag: "阿卡贝拉 · 纯人声", ch: "鲸",
      desc: "32 人纯人声合唱团，不使用任何乐器伴奏。擅长将流行金曲改编为多声部合唱，去年专场演出全场满座。本次带来《星空组曲》人声改编版。" },
    { name: "林屿", tag: "民谣唱作 · 吉他弹唱", ch: "屿",
      desc: "文学院大三唱作人，一把吉他一副嗓音，写尽校园四季。代表作《楼下的猫》《晚自习后》在同学间广为传唱，本次为首场千人级演出。" },
    { name: "焰色反应", tag: "电子金属 · 高燃现场", ch: "焰",
      desc: "理工学院跨界组合，将合成器音色与重金属 riff 融合，现场以高能量著称。鼓手与主唱均为校乐队联盟成员，本次演出配备定制灯光秀。" },
    { name: "半夏乐队", tag: "城市流行 · 夏日限定", ch: "夏",
      desc: "去年音乐节票选「最受欢迎乐队」，曲风轻快明亮，擅长带动全场合唱。本次带来全新 EP《半夏微凉》中的四首作品。" },
    { name: "絮语组合", tag: "民谣二重唱 · 和声治愈", ch: "絮",
      desc: "一对双胞胎姐妹的二重唱组合，和声清澈温暖。擅长老歌新编，本次将演绎三首经典校园民谣，适合在夏夜晚风里静静聆听。" }
  ];
  function fillArtist(i) {
    var a = ARTISTS[i];
    if (!a) return;
    document.getElementById("paName").textContent = a.name;
    document.getElementById("paTag").textContent = a.tag;
    document.getElementById("paDesc").textContent = a.desc;
    var av = document.getElementById("paAvatar");
    av.textContent = a.ch;
    av.className = "popup-artist-avatar a" + (i + 1);
  }

  /* ========== 倒计时（P2） ========== */
  (function countdown() {
    var el = document.getElementById("countdown");
    var target = new Date("2026-05-30T18:30:00+08:00").getTime();
    var diff = target - Date.now();
    var days = Math.ceil(diff / 86400000);
    el.textContent = days > 0 ? days + " 天" : "就是现在";
  })();

  /* ========== 功能三：音频控制 ==========
     背景音乐由 Web Audio 实时合成（原创程序生成旋律，
     无外部音频文件、无版权问题、离线可用），可反复播放/暂停 */
  var audioBtn = document.getElementById("audioBtn");
  var audioLabel = document.getElementById("audioLabel");
  var ctx = null, masterGain = null, playing = false, timer = null, step = 0;

  // C 大调五声音阶的分解和弦旋律 + 低音，8 小节循环
  var MELODY = [523.25, 659.25, 783.99, 1046.5, 783.99, 659.25, 587.33, 783.99,
                440.0, 523.25, 659.25, 880.0, 659.25, 523.25, 587.33, 659.25];
  var BASS = [130.81, 130.81, 110.0, 110.0, 87.31, 87.31, 98.0, 98.0];
  var STEP_MS = 280;

  function initAudio() {
    var AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.16;
    masterGain.connect(ctx.destination);
  }
  function note(freq, time, dur, type, vol) {
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, time);
    g.gain.linearRampToValueAtTime(vol, time + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, time + dur);
    osc.connect(g);
    g.connect(masterGain);
    osc.start(time);
    osc.stop(time + dur);
  }
  function tick() {
    var t = ctx.currentTime + 0.05;
    note(MELODY[step % 16], t, 0.5, "triangle", 0.9);
    if (step % 2 === 0) note(BASS[(step / 2) % 8], t, 0.6, "sine", 0.7);
    step++;
  }
  function startMusic() {
    if (!ctx) initAudio();
    if (ctx.state === "suspended") ctx.resume();
    tick();
    timer = setInterval(tick, STEP_MS);
    playing = true;
    audioBtn.classList.add("playing");
    audioLabel.textContent = "音乐开";
  }
  function stopMusic() {
    clearInterval(timer);
    timer = null;
    playing = false;
    audioBtn.classList.remove("playing");
    audioLabel.textContent = "音乐关";
  }
  audioBtn.addEventListener("click", function () {
    if (playing) stopMusic(); else startMusic();
  });

  /* ========== 功能四：表单闭环 ==========
     必填校验 → 提交成功 → 跳转独立反馈页（P6）并生成回执 */
  var form = document.getElementById("signupForm");
  var fName = document.getElementById("fName");
  var fPhone = document.getElementById("fPhone");

  function setErr(errId, input, msg) {
    document.getElementById(errId).textContent = msg || "";
    if (input) input.classList.toggle("invalid", !!msg);
  }
  // 输入时清除对应错误提示
  fName.addEventListener("input", function () { setErr("errName", fName); });
  fPhone.addEventListener("input", function () { setErr("errPhone", fPhone); });
  document.querySelectorAll('input[name="zone"]').forEach(function (r) {
    r.addEventListener("change", function () { setErr("errZone"); });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = fName.value.trim();
    var phone = fPhone.value.trim();
    var zoneEl = document.querySelector('input[name="zone"]:checked');
    var ok = true;

    if (!name) { setErr("errName", fName, "请填写姓名"); ok = false; }
    if (!phone) { setErr("errPhone", fPhone, "请填写手机号"); ok = false; }
    else if (!/^1[3-9]\d{9}$/.test(phone)) {
      setErr("errPhone", fPhone, "手机号格式不正确，应为 11 位数字"); ok = false;
    }
    if (!zoneEl) { setErr("errZone", null, "请选择意向区域"); ok = false; }
    if (!ok) return;

    // 生成回执编号：XG + 时间戳后6位 + 2位随机
    var code = "XG" + String(Date.now()).slice(-6) +
               String(Math.floor(Math.random() * 90) + 10);
    document.getElementById("rCode").textContent = code;
    document.getElementById("rName").textContent = name;
    document.getElementById("rZone").textContent = zoneEl.value;

    form.reset(); // 重置表单，方便再次报名
    goPage("p6"); // 提交成功 → 独立反馈页
  });
})();
