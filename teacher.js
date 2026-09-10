// 老师名字注入器 + 页面改名按钮。
// 名字优先级：链接参数 ?t=名字  >  上次改过的名字(localStorage)  >  config.js 默认。
// 无需改本文件；改名可直接点页面右上角的「✏️ 改老师名」按钮，或改 config.js。
(function () {
  var LS_KEY = "teacherName";
  function lsGet() { try { return localStorage.getItem(LS_KEY); } catch (e) { return null; } }
  function lsSet(v) { try { localStorage.setItem(LS_KEY, v); } catch (e) {} }

  var params = new URLSearchParams(location.search);
  var fromUrl = params.get("t") || params.get("teacher");
  if (fromUrl) lsSet(fromUrl);
  var name = fromUrl || lsGet() || window.TEACHER_NAME || "XX老师";
  window.TEACHER_NAME = name;

  var PH = /\{\{TEACHER\}\}/g;
  function fixPH(s) { return s.replace(PH, window.TEACHER_NAME); }

  // 立即把已解析的 <title> 里的占位符替换掉，避免标题闪现 {{TEACHER}}
  if (document.title.indexOf("{{TEACHER}}") >= 0) document.title = fixPH(document.title);

  // 遍历文本节点做替换：mode='ph' 替换占位符；mode='name' 把旧名字整体换成新名字
  function walk(node, from, to) {
    if (!node) return;
    if (node.nodeType === 3) {
      if (from) { if (node.nodeValue.indexOf(from) >= 0) node.nodeValue = node.nodeValue.split(from).join(to); }
      else if (node.nodeValue.indexOf("{{TEACHER}}") >= 0) node.nodeValue = fixPH(node.nodeValue);
      return;
    }
    if (node.nodeType === 1 && node.id !== "__teacherEditBtn__") {
      for (var c = node.firstChild; c; c = c.nextSibling) walk(c, from, to);
    }
  }

  function applyPH() {
    if (document.title.indexOf("{{TEACHER}}") >= 0) document.title = fixPH(document.title);
    walk(document.body, null, null);
  }

  // 点按钮改名时调用：把当前显示的旧名字整体换成新名字，不刷新、不丢游戏进度
  window.__setTeacher = function (newName) {
    newName = (newName || "").trim();
    if (!newName || newName === window.TEACHER_NAME) return;
    var old = window.TEACHER_NAME;
    lsSet(newName);
    walk(document.body, old, newName);
    if (document.title.indexOf(old) >= 0) document.title = document.title.split(old).join(newName);
    window.TEACHER_NAME = newName;
    var b = document.getElementById("__teacherEditBtn__");
    if (b) b.title = "当前：" + newName + " · 点我改名";
  };

  function makeEditButton() {
    if (document.getElementById("__teacherEditBtn__")) return;
    var btn = document.createElement("button");
    btn.id = "__teacherEditBtn__";
    btn.type = "button";
    btn.textContent = "✏️ 改老师名";
    btn.title = "当前：" + window.TEACHER_NAME + " · 点我改名";
    btn.setAttribute("style", [
      "position:fixed", "top:10px", "right:10px", "z-index:99999",
      "padding:7px 12px", "border:none", "border-radius:20px",
      "background:rgba(255,255,255,0.92)", "color:#555",
      "font-size:13px", "font-weight:700", "cursor:pointer",
      "box-shadow:0 2px 10px rgba(0,0,0,0.15)", "font-family:inherit",
      "-webkit-tap-highlight-color:transparent"
    ].join(";"));
    btn.onclick = function () {
      var v = window.prompt("请输入老师的名字（例如：小汪老师）", window.TEACHER_NAME);
      if (v !== null) window.__setTeacher(v);
    };
    document.body.appendChild(btn);
  }

  function start() {
    applyPH();
    makeEditButton();
    // 游戏里玩着才动态蹦出来的文字（如答对提示）也兜住替换
    try {
      var mo = new MutationObserver(function (muts) {
        for (var i = 0; i < muts.length; i++) {
          var m = muts[i];
          if (m.addedNodes) for (var j = 0; j < m.addedNodes.length; j++) walk(m.addedNodes[j], null, null);
          if (m.type === "characterData" && m.target.nodeValue &&
              m.target.nodeValue.indexOf("{{TEACHER}}") >= 0) {
            m.target.nodeValue = fixPH(m.target.nodeValue);
          }
        }
      });
      mo.observe(document.body, { childList: true, subtree: true, characterData: true });
    } catch (e) {}
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
