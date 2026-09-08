/* Estate360 demo prototype — shared client-side layer.
   Everything here is in-memory only: nothing is written to a database,
   nothing persists past a page reload (role selection uses sessionStorage
   purely so the presenter doesn't have to re-pick a role on every click). */
(function () {
  "use strict";

  var PAGE_MAP = {
    "dashboard": "dashboard.html",
    "properties": "properties.html",
    "crm": "crm.html",
    "finance": "finance.html",
    "hr": "hr.html",
    "marketing": "marketing.html",
    "reports": "reports.html",
    "settings": "settings.html"
  };

  var ROLES = {
    "super-admin": {
      label: "Super Admin",
      name: "Ngozi Eze",
      title: "Admin",
      initials: "NE",
      hue: 205,
      allowed: ["dashboard", "properties", "crm", "finance", "hr", "marketing", "reports"]
    },
    "management": {
      label: "Management / Executive",
      name: "Tunde Adeyemi",
      title: "Executive",
      initials: "TA",
      hue: 162,
      allowed: ["dashboard", "properties", "crm", "finance", "hr", "marketing", "reports"],
      keepOriginalAvatar: true
    },
    "sales": {
      label: "Sales & Customer Service",
      name: "Adaeze Chukwuma",
      title: "Sales",
      initials: "AC",
      hue: 28,
      allowed: ["dashboard", "properties", "crm", "reports"]
    },
    "account-officer": {
      label: "Account Officer",
      name: "Bilikisu Olatunji",
      title: "Accounts",
      initials: "BO",
      hue: 262,
      allowed: ["dashboard", "properties", "finance", "reports"]
    },
    "hr-admin": {
      label: "HR / Admin",
      name: "Chidinma Nwosu",
      title: "HR",
      initials: "CN",
      hue: 340,
      allowed: ["dashboard", "hr", "reports"]
    },
    "operations": {
      label: "Operations",
      name: "Femi Ezechukwu",
      title: "Operations",
      initials: "FE",
      hue: 190,
      allowed: ["dashboard", "properties", "reports"]
    },
    "employee": {
      label: "Employee (Self-Service)",
      name: "Dapo Alabi",
      title: "Employee",
      initials: "DA",
      hue: 45,
      allowed: ["dashboard", "hr"]
    }
  };

  var ROLE_KEY = "estate360_role";

  function getRoleId() {
    try {
      var r = sessionStorage.getItem(ROLE_KEY);
      if (r && ROLES[r]) return r;
    } catch (e) {}
    return "management";
  }

  function setRoleId(id) {
    try { sessionStorage.setItem(ROLE_KEY, id); } catch (e) {}
  }

  function avatarDataUri(initials, hue) {
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">' +
      '<rect width="64" height="64" rx="32" fill="hsl(' + hue + ',38%,32%)"/>' +
      '<text x="32" y="40" font-family="Inter, sans-serif" font-size="24" font-weight="700" ' +
      'fill="#ffffff" text-anchor="middle">' + initials + '</text></svg>';
    return "data:image/svg+xml;base64," + btoa(svg);
  }

  /* ---------- toast ---------- */
  function ensureToastHost() {
    var host = document.getElementById("e360-toast-host");
    if (host) return host;
    var style = document.createElement("style");
    style.textContent =
      "#e360-toast-host{position:fixed;right:20px;bottom:20px;z-index:99999;display:flex;flex-direction:column;gap:10px;pointer-events:none;}" +
      ".e360-toast{pointer-events:auto;min-width:260px;max-width:360px;background:#181D22;color:#EDEFF1;border:1px solid #2A323A;" +
      "border-radius:10px;padding:12px 14px;box-shadow:0 8px 24px rgba(0,0,0,.35);font:500 13.5px/1.4 Inter,-apple-system,sans-serif;" +
      "display:flex;gap:10px;align-items:flex-start;transform:translateY(8px);opacity:0;transition:transform .22s ease,opacity .22s ease;}" +
      ".e360-toast.show{transform:translateY(0);opacity:1;}" +
      ".e360-toast .dot{flex:0 0 auto;width:8px;height:8px;border-radius:50%;margin-top:4px;}" +
      ".e360-toast.success .dot{background:#31AE90;}" +
      ".e360-toast.info .dot{background:#E3A94C;}" +
      ".e360-toast b{display:block;color:#fff;margin-bottom:2px;}";
    document.head.appendChild(style);
    host = document.createElement("div");
    host.id = "e360-toast-host";
    document.body.appendChild(host);
    return host;
  }

  function toast(message, opts) {
    opts = opts || {};
    var host = ensureToastHost();
    var el = document.createElement("div");
    el.className = "e360-toast " + (opts.variant || "success");
    el.innerHTML = "<span class='dot'></span><span>" +
      (opts.title ? "<b>" + opts.title + "</b>" : "") + message + "</span>";
    host.appendChild(el);
    requestAnimationFrame(function () { el.classList.add("show"); });
    setTimeout(function () {
      el.classList.remove("show");
      setTimeout(function () { el.remove(); }, 250);
    }, opts.duration || 3400);
  }

  /* ---------- nav wiring ---------- */
  function rewireNav() {
    document.querySelectorAll("a[data-path]").forEach(function (a) {
      var path = a.getAttribute("data-path");
      if (PAGE_MAP[path]) {
        a.setAttribute("href", PAGE_MAP[path]);
      } else {
        a.addEventListener("click", function (e) {
          e.preventDefault();
          toast("Not part of tonight's demo build.", { variant: "info", title: a.textContent.trim() });
        });
      }
    });
  }

  /* ---------- role application ---------- */
  function applyRole() {
    var role = ROLES[getRoleId()];
    var header = document.querySelector("header");
    if (!header) return;

    header.querySelectorAll("span, div").forEach(function (el) {
      if (el.children.length === 0) {
        var t = el.textContent.trim();
        if (t === "Tunde Adeyemi") el.textContent = role.name;
        if (t === "Executive") el.textContent = role.title;
      }
    });

    var avatarImg = header.querySelector('img[alt*="avatar" i], img[alt*="Tunde" i], img[alt="Profile"]');
    if (avatarImg && !role.keepOriginalAvatar) {
      if (!avatarImg.dataset.originalSrc) avatarImg.dataset.originalSrc = avatarImg.src;
      avatarImg.src = avatarDataUri(role.initials, role.hue);
    } else if (avatarImg && role.keepOriginalAvatar && avatarImg.dataset.originalSrc) {
      avatarImg.src = avatarImg.dataset.originalSrc;
    }

    // hide sidebar modules this role doesn't get (utility links like Settings/Help are exempt)
    var UTILITY_PATHS = ["settings", "help-and-support"];
    document.querySelectorAll("aside nav a[data-path], nav a[data-path]").forEach(function (a) {
      var path = a.getAttribute("data-path");
      if (PAGE_MAP[path] && UTILITY_PATHS.indexOf(path) === -1) {
        var li = a.closest("li") || a;
        li.style.display = role.allowed.indexOf(path) === -1 ? "none" : "";
      }
    });

    // HR module: swap between the admin workspace and the employee self-service view
    var hrEmployeeView = document.getElementById("hrEmployeeView");
    if (hrEmployeeView) {
      var isEmployee = getRoleId() === "employee";
      var hrAdminKpi = document.getElementById("hrAdminKpi");
      var hrAdminTabBar = document.getElementById("hrAdminTabBar");
      var hrAdminHeaderActions = document.getElementById("hrAdminHeaderActions");
      var hrPageIntro = document.getElementById("hrPageIntro");
      hrEmployeeView.style.display = isEmployee ? "flex" : "none";
      if (hrAdminKpi) hrAdminKpi.style.display = isEmployee ? "none" : "grid";
      if (hrAdminTabBar) hrAdminTabBar.style.display = isEmployee ? "none" : "flex";
      if (hrAdminHeaderActions) hrAdminHeaderActions.style.display = isEmployee ? "none" : "flex";
      if (hrPageIntro) {
        var h1 = hrPageIntro.querySelector("h1");
        var p = hrPageIntro.querySelector("p");
        if (isEmployee) {
          if (h1 && !h1.dataset.original) h1.dataset.original = h1.textContent;
          if (p && !p.dataset.original) p.dataset.original = p.textContent;
          if (h1) h1.textContent = "My HR Self-Service";
          if (p) p.textContent = "Leave, loans, timesheet and payslips for " + role.name + ".";
        } else {
          if (h1 && h1.dataset.original) h1.textContent = h1.dataset.original;
          if (p && p.dataset.original) p.textContent = p.dataset.original;
        }
      }
      document.querySelectorAll(".hr-panel").forEach(function (panel) {
        panel.style.display = isEmployee ? "none" : (panel.dataset.panel === "directory" ? "flex" : panel.style.display);
      });
      if (isEmployee && window.Estate360 && window.Estate360.empSetTab) {
        window.Estate360.empSetTab("overview");
      }
    }

    // clicking the user block reopens the role picker (handy mid-demo)
    var userBlock = header.querySelector('img[alt*="avatar" i], img[alt*="Tunde" i], img[alt="Profile"]');
    if (userBlock) {
      var wrap = userBlock.closest("div");
      if (wrap && !wrap.dataset.e360Wired) {
        wrap.dataset.e360Wired = "1";
        wrap.style.cursor = "pointer";
        wrap.style.borderRadius = "999px";
        wrap.style.padding = "4px 8px 4px 8px";
        wrap.style.transition = "background .15s ease";
        wrap.title = "Switch demo role";
        wrap.addEventListener("mouseenter", function () { wrap.style.background = "rgba(0,0,0,.05)"; });
        wrap.addEventListener("mouseleave", function () { wrap.style.background = ""; });
        wrap.addEventListener("click", function () { window.location.href = "index.html"; });
        if (!wrap.querySelector(".e360-switch-chevron")) {
          var chevron = document.createElement("span");
          chevron.className = "material-symbols-outlined e360-switch-chevron";
          chevron.textContent = "unfold_more";
          chevron.style.cssText = "font-size:16px;color:var(--e360-chevron-color,#6f7976);flex-shrink:0;";
          wrap.appendChild(chevron);
        }
      }
    }
  }

  /* ---------- generic fallback for unwired buttons ---------- */
  function wireGenericButtons() {
    document.addEventListener("click", function (e) {
      var btn = e.target.closest("button[type='button']");
      if (!btn) return;
      if (btn.hasAttribute("onclick")) return; // already has real behavior
      if (btn.dataset.e360Wired) return;
      var label = (btn.getAttribute("aria-label") || btn.textContent || "").trim().replace(/\s+/g, " ");
      if (!label) label = "Action";
      toast("Demo prototype — no data is written to a server.", { variant: "info", title: label });
    });
  }

  /* ---------- golden-path handlers, called via inline onclick ---------- */
  window.Estate360Roles = ROLES;
  window.Estate360SetRole = setRoleId;

  window.Estate360 = {
    allocatePlot: function (btn) {
      btn.disabled = true;
      btn.innerHTML = "<span class='material-symbols-outlined text-[20px]'>check_circle</span><span>Allocated — Offer Letter Generated</span>";
      btn.classList.add("opacity-90");
      var stepLabel = document.querySelector(".font-financial-tabular.text-label-sm.text-label-sm.font-semibold.text-on-surface-variant");
      if (stepLabel && /Step 1/.test(stepLabel.textContent)) stepLabel.textContent = "Step 2 of 2 Complete";
      toast("Plot 14B allocated to Dr. Babatunde Adeleke. Offer letter and installment schedule are ready.", {
        variant: "success", title: "Allocation confirmed", duration: 5000
      });
    },

    recordPayment: function (event, form) {
      event.preventDefault();
      var btn = form.querySelector("button[type='submit']");
      if (btn) {
        btn.disabled = true;
        var original = btn.innerHTML;
        btn.innerHTML = "<span class='material-symbols-outlined text-[18px]'>check_circle</span><span>Payment Recorded</span>";
        setTimeout(function () { btn.disabled = false; btn.innerHTML = original; }, 4000);
      }
      toast("₦910,000 logged and reconciled to Stanbic Escrow. Receipt generated for Dr. Babatunde Adeleke.", {
        variant: "success", title: "Payment recorded", duration: 5000
      });
    },

    sendReminder: function (btn) {
      var row = btn.closest("tr");
      var name = row ? row.querySelector("td span.font-body-md, td span.font-semibold") : null;
      toast("Overdue notice sent by SMS, email and WhatsApp.", { variant: "success", title: "Reminder sent" });
      btn.textContent = "Sent";
      btn.disabled = true;
    },

    submitLeadForm: function (event, form) {
      event.preventDefault();
      toast("Lead added to the CRM pipeline at the New Inquiry stage.", { variant: "success", title: "Lead captured", duration: 4500 });
    },

    publishListing: function (event, form) {
      event.preventDefault();
      var btn = form.querySelector("button[type='submit']");
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = "<span class='material-symbols-outlined text-[20px]'>check_circle</span><span>Listing Published</span>";
      }
      toast("New plot GVE-EP-096 is now live in inventory as Available.", {
        variant: "success", title: "Listing published", duration: 4000
      });
      setTimeout(function () { window.location.href = "properties.html"; }, 1600);
    },

    submitNewLead: function (event, form) {
      event.preventDefault();
      var nameField = form.querySelector('input[type="text"]');
      var name = (nameField && nameField.value.trim()) || "The new lead";
      var btn = form.querySelector("button[type='submit']");
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = "<span class='material-symbols-outlined text-[20px]'>check_circle</span><span>Lead Added</span>";
      }
      toast(name + " was added to the pipeline at the New stage.", {
        variant: "success", title: "Lead added", duration: 4000
      });
      setTimeout(function () { window.location.href = "crm.html"; }, 1600);
    },

    crmSetView: function (mode) {
      var kanban = document.getElementById("crmKanbanView");
      var list = document.getElementById("crmListView");
      var kanbanBtn = document.getElementById("crmViewKanbanBtn");
      var listBtn = document.getElementById("crmViewListBtn");
      if (!kanban || !list) return;

      var activeCls = ["bg-surface-container-lowest", "text-primary", "shadow-xs", "font-semibold"];
      var inactiveCls = ["text-on-surface-variant", "font-medium"];

      if (mode === "list") {
        kanban.hidden = true;
        list.hidden = false;
        kanbanBtn.classList.remove.apply(kanbanBtn.classList, activeCls);
        kanbanBtn.classList.add.apply(kanbanBtn.classList, inactiveCls);
        listBtn.classList.remove.apply(listBtn.classList, inactiveCls);
        listBtn.classList.add.apply(listBtn.classList, activeCls);
        this._crmBuildListView();
      } else {
        kanban.hidden = false;
        list.hidden = true;
        listBtn.classList.remove.apply(listBtn.classList, activeCls);
        listBtn.classList.add.apply(listBtn.classList, inactiveCls);
        kanbanBtn.classList.remove.apply(kanbanBtn.classList, inactiveCls);
        kanbanBtn.classList.add.apply(kanbanBtn.classList, activeCls);
      }
    },

    _crmStageBadgeClass: function (stage) {
      var map = {
        "New": "bg-blue-50 text-blue-800",
        "Contacted": "bg-indigo-50 text-indigo-800",
        "Site Visit": "bg-purple-50 text-purple-800",
        "Negotiation": "bg-amber-50 text-amber-900",
        "Offer": "bg-orange-50 text-orange-800",
        "Won": "bg-emerald-50 text-emerald-800",
        "Lost": "bg-error-container text-on-error-container"
      };
      return map[stage] || "bg-surface-container text-on-surface-variant";
    },

    _crmBuildListView: function () {
      var body = document.getElementById("crmListViewBody");
      if (!body || body.dataset.built) return;
      var self = this;
      var lanes = document.querySelectorAll("#crmKanbanView .grid.grid-flow-col > div");
      var rows = [];
      lanes.forEach(function (lane) {
        var stageEl = lane.querySelector(".font-title-sm.text-title-sm.text-on-surface.font-bold");
        var laneStage = stageEl ? stageEl.textContent.trim() : "—";
        lane.querySelectorAll("article").forEach(function (card) {
          var nameEl = card.querySelector("h2");
          var idEl = card.querySelector(".font-label-sm.text-label-sm.text-on-surface-variant");
          var amountEl = card.querySelector('[class*="font-financial-tabular"][class*="font-bold"]');
          var name = nameEl ? nameEl.textContent.trim() : "—";
          var clientId = idEl ? idEl.textContent.trim().split("•")[0].trim() : "—";
          var amount = amountEl ? amountEl.textContent.trim() : "—";

          var stage = laneStage;
          if (laneStage.indexOf("Closed") === 0) {
            var cardText = card.textContent;
            stage = /\bLost\b/.test(cardText) ? "Lost" : "Won";
          }
          var badgeClass = self._crmStageBadgeClass(stage);

          rows.push('<tr class="h-14 hover:bg-surface-container-low transition-colors">' +
            '<td class="px-space-20 py-space-12 font-title-sm text-title-sm font-semibold text-on-surface">' + name + '</td>' +
            '<td class="px-space-16 py-space-12 font-financial-tabular text-on-surface-variant">' + clientId + '</td>' +
            '<td class="px-space-16 py-space-12 text-right font-financial-tabular font-bold text-on-surface">' + amount + '</td>' +
            '<td class="px-space-16 py-space-12"><span class="inline-flex items-center px-space-8 py-0.5 rounded-full ' + badgeClass + ' font-label-sm text-label-sm font-semibold">' + stage + '</span></td>' +
            '<td class="px-space-20 py-space-12 text-center"><button aria-label="View client" class="p-1.5 rounded-lg text-primary hover:bg-surface-container-high transition-colors" onclick="location.href=\'client-profile.html\'" type="button"><span class="material-symbols-outlined text-[20px]">visibility</span></button></td>' +
            '</tr>');
        });
      });
      body.innerHTML = rows.join("");
      body.dataset.built = "1";
    },

    reportsSetTab: function (tab) {
      document.querySelectorAll(".report-tab").forEach(function (btn) {
        var active = btn.dataset.tab === tab;
        btn.classList.toggle("bg-primary", active);
        btn.classList.toggle("text-on-primary", active);
        btn.classList.toggle("shadow-sm", active);
        btn.classList.toggle("font-semibold", active);
        btn.classList.toggle("text-title-sm", active);
        btn.classList.toggle("text-on-surface-variant", !active);
        btn.classList.toggle("text-body-md", !active);
        btn.classList.toggle("hover:text-on-surface", !active);
        btn.classList.toggle("hover:bg-surface-container-high", !active);
      });
      document.querySelectorAll(".report-panel").forEach(function (panel) {
        panel.style.display = panel.dataset.panel === tab ? "flex" : "none";
      });
    },

    generateCustomReport: function (btn) {
      var original = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = "<span class='material-symbols-outlined text-[20px]'>check_circle</span><span>Report Ready</span>";
      setTimeout(function () { btn.disabled = false; btn.innerHTML = original; }, 3000);
      toast("Your custom report has been generated and added to the list below.", {
        variant: "success", title: "Report generated", duration: 4000
      });
    },

    settingsSetTab: function (tab) {
      document.querySelectorAll(".settings-tab").forEach(function (btn) {
        var active = btn.dataset.tab === tab;
        btn.classList.toggle("bg-primary", active);
        btn.classList.toggle("text-on-primary", active);
        btn.classList.toggle("shadow-sm", active);
        btn.classList.toggle("font-semibold", active);
        btn.classList.toggle("text-title-sm", active);
        btn.classList.toggle("text-on-surface-variant", !active);
        btn.classList.toggle("text-body-md", !active);
        btn.classList.toggle("hover:text-on-surface", !active);
        btn.classList.toggle("hover:bg-surface-container-high", !active);
      });
      document.querySelectorAll(".settings-panel").forEach(function (panel) {
        panel.style.display = panel.dataset.panel === tab ? "flex" : "none";
      });
    },

    toggleInvitePanel: function () {
      var panel = document.getElementById("invitePanel");
      if (!panel) return;
      panel.style.display = panel.style.display === "flex" ? "none" : "flex";
    },

    sendInvite: function (btn) {
      var panel = document.getElementById("invitePanel");
      var nameField = panel.querySelector('input[type="text"]');
      var name = (nameField && nameField.value.trim()) || "The new team member";
      toast(name + " has been invited and will appear as Pending until they sign in.", {
        variant: "success", title: "Invite sent", duration: 4500
      });
      this.toggleInvitePanel();
    },

    saveSettings: function (btn) {
      var original = btn.innerHTML;
      btn.innerHTML = "Saved";
      toast("Organization settings updated.", { variant: "success", title: "Saved" });
      setTimeout(function () { btn.innerHTML = original; }, 2000);
    },

    toggleSwitch: function (btn) {
      var on = btn.getAttribute("aria-checked") === "true";
      var next = !on;
      btn.setAttribute("aria-checked", String(next));
      btn.classList.toggle("bg-primary", next);
      btn.classList.toggle("bg-surface-container-high", !next);
      var knob = btn.querySelector("span");
      if (knob) knob.classList.toggle("translate-x-5", next);
    },

    hrSetTab: function (tab) {
      document.querySelectorAll(".hr-tab").forEach(function (btn) {
        var active = btn.dataset.tab === tab;
        btn.classList.toggle("bg-primary", active);
        btn.classList.toggle("text-on-primary", active);
        btn.classList.toggle("shadow-sm", active);
        btn.classList.toggle("font-semibold", active);
        btn.classList.toggle("text-title-sm", active);
        btn.classList.toggle("text-on-surface-variant", !active);
        btn.classList.toggle("text-body-md", !active);
        btn.classList.toggle("hover:text-on-surface", !active);
        btn.classList.toggle("hover:bg-surface-container-high", !active);
      });
      document.querySelectorAll(".hr-panel").forEach(function (panel) {
        var show = panel.dataset.panel === tab;
        panel.style.display = show ? (panel.tagName === "SECTION" && panel.classList.contains("grid") ? "grid" : "flex") : "none";
      });
    },

    empSetTab: function (tab) {
      document.querySelectorAll(".emp-tab").forEach(function (btn) {
        var active = btn.dataset.tab === tab;
        btn.classList.toggle("bg-primary", active);
        btn.classList.toggle("text-on-primary", active);
        btn.classList.toggle("shadow-sm", active);
        btn.classList.toggle("font-semibold", active);
        btn.classList.toggle("text-title-sm", active);
        btn.classList.toggle("text-on-surface-variant", !active);
        btn.classList.toggle("text-body-md", !active);
        btn.classList.toggle("hover:text-on-surface", !active);
        btn.classList.toggle("hover:bg-surface-container-high", !active);
      });
      document.querySelectorAll(".emp-panel").forEach(function (panel) {
        panel.style.display = panel.dataset.panel === tab ? "flex" : "none";
      });
    },

    submitLeaveRequest: function (event, form) {
      event.preventDefault();
      form.reset();
      toast("Sent to Chidinma Nwosu (HR) for approval. You'll see it under Leave History once reviewed.", {
        variant: "success", title: "Leave request submitted", duration: 5000
      });
    },

    submitLoanRequest: function (event, form) {
      event.preventDefault();
      form.reset();
      toast("Sent to HR & Finance for review. Most requests are decided within 3 working days.", {
        variant: "success", title: "Loan application submitted", duration: 5000
      });
    },

    downloadPayslip: function (btn, label) {
      toast("Downloading " + (label || "payslip") + " (demo build — no file is generated).", {
        variant: "info", title: "Payslip"
      });
    },

    decideLoan: function (cardId, decision, name) {
      var card = document.getElementById(cardId);
      if (!card) return;
      if (decision === "declined") {
        card.classList.add("opacity-40", "pointer-events-none");
        toast(name + "'s loan application was declined.", { variant: "info", title: "Application declined" });
      } else {
        card.innerHTML = "<div class='p-space-12 bg-emerald-50 text-emerald-800 rounded-lg text-center font-label-md font-semibold flex items-center justify-center gap-2'>" +
          "<span class='material-symbols-outlined text-[18px]'>check_circle</span>Approved for " + name + "</div>";
        toast(name + "'s loan has been approved and added to active loans.", { variant: "success", title: "Loan approved" });
      }
    },

    mktSetTab: function (tab) {
      document.querySelectorAll(".mkt-tab").forEach(function (btn) {
        var active = btn.dataset.tab === tab;
        btn.classList.toggle("bg-primary", active);
        btn.classList.toggle("text-on-primary", active);
        btn.classList.toggle("shadow-sm", active);
        btn.classList.toggle("font-semibold", active);
        btn.classList.toggle("text-title-sm", active);
        btn.classList.toggle("text-on-surface-variant", !active);
        btn.classList.toggle("text-body-md", !active);
        btn.classList.toggle("hover:text-on-surface", !active);
        btn.classList.toggle("hover:bg-surface-container-high", !active);
      });
      document.querySelectorAll(".mkt-panel").forEach(function (panel) {
        panel.style.display = panel.dataset.panel === tab ? "flex" : "none";
      });
    },

    sendBulkMessage: function (btn) {
      var original = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = "<span class='material-symbols-outlined text-[20px]'>check_circle</span><span>Sent</span>";
      toast("Message queued for delivery to 184 leads. You'll see it in Recent Sends once delivery completes.", {
        variant: "success", title: "Bulk message sent", duration: 4500
      });
      setTimeout(function () { btn.disabled = false; btn.innerHTML = original; }, 3000);
    },

    copyEmbedCode: function (btn) {
      var original = btn.textContent;
      btn.textContent = "Copied";
      toast("Embed code copied to clipboard.", { variant: "success", title: "Copied", duration: 2500 });
      setTimeout(function () { btn.textContent = original; }, 1800);
    },

    finSetTab: function (tab) {
      document.querySelectorAll(".fin-tab").forEach(function (btn) {
        var active = btn.dataset.tab === tab;
        btn.classList.toggle("bg-primary", active);
        btn.classList.toggle("text-on-primary", active);
        btn.classList.toggle("shadow-sm", active);
        btn.classList.toggle("font-semibold", active);
        btn.classList.toggle("text-title-sm", active);
        btn.classList.toggle("text-on-surface-variant", !active);
        btn.classList.toggle("text-body-md", !active);
        btn.classList.toggle("hover:text-on-surface", !active);
        btn.classList.toggle("hover:bg-surface-container-high", !active);
      });
      document.querySelectorAll(".fin-panel").forEach(function (panel) {
        panel.style.display = panel.dataset.panel === tab ? "flex" : "none";
      });
    },

    reconcileAll: function (btn) {
      toast("All matched transactions have been reconciled to the ledger.", { variant: "success", title: "Reconciled", duration: 4000 });
    },

    matchTransaction: function (rowId) {
      var row = document.getElementById(rowId);
      if (!row) return;
      var statusCell = row.cells[row.cells.length - 1];
      statusCell.innerHTML = "<span class='inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-label-sm text-label-sm font-semibold'><span class='w-1.5 h-1.5 rounded-full bg-emerald-600'></span>Matched</span>";
      toast("Transaction matched to a client record.", { variant: "success", title: "Matched" });
    },

    fileVatReturn: function (btn) {
      var original = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = "<span class='material-symbols-outlined text-[18px]'>check_circle</span><span>Filed</span>";
      toast("November VAT return has been filed with FIRS.", { variant: "success", title: "Return filed", duration: 4000 });
      setTimeout(function () { btn.disabled = false; btn.innerHTML = original; }, 3000);
    },

    completeFollowUp: function (btn) {
      var row = btn.closest("div.flex.items-center.justify-between");
      if (row) {
        row.style.opacity = "0.4";
        row.style.pointerEvents = "none";
      }
      toast("Follow-up marked complete.", { variant: "success", title: "Done" });
    },

    playRecording: function (btn) {
      var original = btn.innerHTML;
      btn.innerHTML = "<span class='material-symbols-outlined text-[16px]'>pause</span>";
      toast("Playing recorded call (demo audio not available in the prototype).", { variant: "info", title: "Call recording", duration: 3000 });
      setTimeout(function () { btn.innerHTML = original; }, 2500);
    }
  };

  /* clicking "New Listing" (header) or "Add Property" (properties page) opens the new-listing form */
  function wireCreateButtons() {
    document.querySelectorAll("button").forEach(function (btn) {
      var textSpan = Array.from(btn.querySelectorAll("span")).find(function (s) {
        return !s.classList.contains("material-symbols-outlined");
      });
      var label = (textSpan ? textSpan.textContent : btn.textContent).trim();
      if (label === "New Listing" || label === "Add Property") {
        btn.dataset.e360Wired = "1";
        btn.addEventListener("click", function () { window.location.href = "new-listing.html"; });
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    rewireNav();
    applyRole();
    wireCreateButtons();
    wireGenericButtons();
  });
})();
