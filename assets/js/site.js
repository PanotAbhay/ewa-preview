/* Expression with Art preview site. No libraries. */
(function () {
  "use strict";

  var doc = document.documentElement;

  /* Menu sheet on small screens */
  var menu = document.querySelector("[data-menu]");
  var nav = document.getElementById("site-nav");
  var header = document.querySelector(".site-header");
  if (menu && nav) {
    var label = menu.querySelector(".menu-label");
    var narrow = window.matchMedia("(max-width: 999px)");
    var setMenu = function (open) {
      if (open && header) nav.style.setProperty("--sheet-top", header.getBoundingClientRect().bottom + "px");
      nav.classList.toggle("open", open);
      menu.classList.toggle("is-open", open);
      doc.classList.toggle("menu-open", open);
      if (label) label.textContent = open ? "Close" : "Menu";
    };
    menu.addEventListener("click", function () { setMenu(!nav.classList.contains("open")); });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) setMenu(false);
    });
    narrow.addEventListener("change", function (e) { if (!e.matches) setMenu(false); });
  }

  /* Review notes on and off. The choice is kept for this browser only. */
  var toggle = document.querySelector("[data-notes-toggle]");
  function showNotesState() {
    if (!toggle) return;
    toggle.textContent = doc.classList.contains("notes-off") ? "Show review notes" : "Hide review notes";
  }
  if (toggle) {
    showNotesState();
    toggle.addEventListener("click", function () {
      var off = !doc.classList.contains("notes-off");
      doc.classList.toggle("notes-off", off);
      try { localStorage.setItem("ewa-notes", off ? "off" : "on"); } catch (e) { /* storage blocked */ }
      showNotesState();
    });
  }

  /* Artwork lightbox */
  var box = document.querySelector("[data-lightbox]");
  if (box && typeof box.showModal === "function") {
    var boxImg = box.querySelector("[data-lightbox-img]");
    var boxCap = box.querySelector("[data-lightbox-caption]");
    document.querySelectorAll("[data-art-open]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var fig = btn.closest("figure");
        var cap = fig ? fig.querySelector("figcaption") : null;
        boxImg.src = btn.getAttribute("data-full");
        boxCap.textContent = cap ? cap.textContent.trim() : "";
        box.showModal();
      });
    });
    box.addEventListener("click", function (e) {
      if (e.target === box) box.close();
    });
    box.addEventListener("close", function () {
      boxImg.removeAttribute("src");
    });
  } else {
    /* No dialog support: open the large image as a normal link. */
    document.querySelectorAll("[data-art-open]").forEach(function (btn) {
      btn.addEventListener("click", function () { window.location.href = btn.getAttribute("data-full"); });
    });
  }

  /* Enquiry form */
  var form = document.querySelector("[data-enquiry]");
  if (!form) return;

  var done = form.querySelector("[data-form-done]");
  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function value(name) {
    var el = form.elements[name];
    if (!el) return "";
    if (el instanceof RadioNodeList) return el.value;
    if (el.type === "checkbox") return el.checked ? el.value : "";
    return el.value.trim();
  }

  function showFor() {
    var type = value("type");
    var method = value("method");
    form.querySelectorAll("[data-show-for]").forEach(function (el) {
      el.hidden = el.getAttribute("data-show-for").split(" ").indexOf(type) === -1;
    });
    form.querySelectorAll("[data-show-for-method]").forEach(function (el) {
      el.hidden = el.getAttribute("data-show-for-method") !== method;
    });
  }

  /* Preselect the topic from the link, for example contact/?type=volunteer */
  try {
    var wanted = new URLSearchParams(window.location.search).get("type");
    if (!wanted && document.body.classList.contains("page-get-support")) wanted = "self";
    if (wanted) {
      var radio = form.querySelector('input[name="type"][value="' + wanted.replace(/[^a-z]/g, "") + '"]');
      if (radio) radio.checked = true;
    }
  } catch (e) { /* old browser */ }
  showFor();
  form.addEventListener("change", showFor);

  function setError(field, message) {
    var wrap = form.querySelector('[data-field="' + field + '"]');
    var text = document.getElementById(field + "-error");
    if (!wrap || !text) return;
    wrap.classList.toggle("has-error", !!message);
    text.textContent = message || "";
    text.hidden = !message;
  }

  function validate() {
    var type = value("type");
    var method = value("method");
    var checks = [
      ["type", type ? "" : "Select what your message is about"],
      ["name", value("name") ? "" : "Enter your name"],
      ["method", method ? "" : "Select how we should reply"],
      ["email", method !== "email" ? "" : !value("email") ? "Enter your email address"
        : !emailPattern.test(value("email")) ? "Enter an email address in the correct format, like name@example.com" : ""],
      ["phone", method !== "phone" ? "" : !value("phone") ? "Enter a phone number, like 07700 900 982"
        : !/^\d{10,13}$/.test(value("phone").replace(/[\s()+-]/g, "")) ? "Enter a phone number in the correct format, like 07700 900 982" : ""],
      ["agree", (type === "family" || type === "referral") && !value("agree") ? "Confirm that the person knows you are contacting us and agrees to it" : ""],
    ];
    var first = null;
    checks.forEach(function (c) {
      setError(c[0], c[1]);
      if (c[1] && !first) first = c[0];
    });
    return first;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var first = validate();
    if (first) {
      var wrap = form.querySelector('[data-field="' + first + '"]');
      if (wrap) wrap.scrollIntoView({ block: "center" });
      return;
    }
    form.querySelectorAll(".field, .privacy-line, .form-intro, button[type=submit]").forEach(function (el) {
      el.setAttribute("data-was-hidden", el.hidden ? "1" : "0");
      el.hidden = true;
    });
    done.hidden = false;
    done.scrollIntoView({ block: "center" });
  });

  form.querySelector("[data-form-reset]").addEventListener("click", function () {
    form.reset();
    form.querySelectorAll("[data-was-hidden]").forEach(function (el) {
      el.hidden = el.getAttribute("data-was-hidden") === "1";
      el.removeAttribute("data-was-hidden");
    });
    ["type", "name", "method", "email", "phone", "agree"].forEach(function (f) { setError(f, ""); });
    done.hidden = true;
    showFor();
  });
})();
