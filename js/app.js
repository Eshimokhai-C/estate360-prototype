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
    "legal": "legal.html",
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
      allowed: ["dashboard", "properties", "crm", "finance", "hr", "legal", "marketing", "reports"]
    },
    "management": {
      label: "Management / Executive",
      name: "Tunde Adeyemi",
      title: "Executive",
      initials: "TA",
      hue: 162,
      allowed: ["dashboard", "properties", "crm", "finance", "hr", "legal", "marketing", "reports"],
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
    "legal": {
      label: "Legal",
      name: "Barr. Chioma Okonkwo",
      title: "Legal",
      initials: "CO",
      hue: 215,
      allowed: ["dashboard", "properties", "crm", "legal", "reports"]
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
  /* ---------- shared demo data: clients, contracts, expenses ----------
     Held in sessionStorage so a contract advanced on one page (or an expense
     submitted as an employee) is still there when the presenter switches role. */
  var CLIENTS = [
    { name: "Dr. Babatunde Adeleke", id: "CL-0412", email: "b.adeleke@example.ng", phone: "+234 803 555 0142" },
    { name: "Hajia Amina Dambazau", id: "CL-0398", email: "amina.dambazau@example.ng", phone: "+234 802 330 7781" },
    { name: "Ayotunde & Bisi Coker", id: "CL-0405", email: "coker.family@example.ng", phone: "+234 805 214 6609" },
    { name: "Zainab Ahmed-Bello", id: "CL-0417", email: "zainab.ab@example.ng", phone: "+234 809 118 4420" },
    { name: "Flutterwave Tech Hub Ltd", id: "CL-0361", email: "facilities@techhub.example.ng", phone: "+234 1 700 0145" },
    { name: "Col. Ibrahim Bello (Rtd)", id: "CL-0377", email: "ibrahim.bello@example.ng", phone: "+234 803 902 5518" },
    { name: "Kunle Sorinola Holdings", id: "CL-0352", email: "legal@sorinola.example.ng", phone: "+234 1 271 8830" }
  ];
  var PROPERTIES = ["Plot 14B, Green Valley Estate", "Unit 4B, Lekki Pearl Manor", "Lekki Pearl Manor (Unit 031)",
    "Horizon Commercial Heights, VI", "Alausa Commercial Plot 12", "Plot 08, Maitama Hills"];
  var CONTRACT_TYPES = ["Sale Agreement", "Offer Letter", "Allocation Letter", "Deed of Assignment",
    "Power of Attorney", "Governor's Consent / C of O"];
  var STAGES = ["Draft", "Legal Review", "Sent for Signature", "Executed"];
  var STATUS_CLS = {
    "Draft": "bg-surface-container text-on-surface-variant",
    "Legal Review": "bg-amber-50 text-amber-900",
    "Sent for Signature": "bg-blue-50 text-blue-800",
    "Executed": "bg-emerald-50 text-emerald-800"
  };
  var CONTRACT_KEY = "estate360_contracts_v1";
  var EXPENSE_KEY = "estate360_expenses_v1";

  function iso(offsetDays) {
    var d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
  }
  function fmtDate(s) {
    if (!s) return "—";
    return new Date(s + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }
  function daysLeft(s) {
    var t = new Date(); t.setHours(0, 0, 0, 0);
    return Math.round((new Date(s + "T00:00:00") - t) / 86400000);
  }
  function money(n) { return "₦" + Number(n || 0).toLocaleString("en-US"); }
  function readStore(key) {
    try { var r = sessionStorage.getItem(key); if (r) return JSON.parse(r); } catch (e) {}
    return null;
  }
  function writeStore(key, v) { try { sessionStorage.setItem(key, JSON.stringify(v)); } catch (e) {} }
  function byId(id) { return document.getElementById(id); }
  function setText(id, v) { var el = byId(id); if (el) el.textContent = v; }
  function currentRoleName() { return ROLES[getRoleId()].name; }
  function statusBadge(s) {
    return '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full ' + (STATUS_CLS[s] || "") +
      ' font-label-sm text-label-sm font-semibold whitespace-nowrap">' + s + "</span>";
  }
  function expiryNote(c) {
    if (!c.expires || c.status === "Executed") return "";
    var d = daysLeft(c.expires);
    if (d < 0) return '<span class="block font-label-sm text-label-sm text-error font-semibold">Offer expired</span>';
    return '<span class="block font-label-sm text-label-sm ' + (d <= 7 ? "text-error" : "text-on-surface-variant") +
      ' font-semibold">Expires in ' + d + (d === 1 ? " day" : " days") + "</span>";
  }

  function seedContracts() {
    function c(id, type, client, property, value, status, ago, exp, owner) {
      var log = [{ d: iso(-ago), t: "Draft created by " + owner }];
      var idx = STAGES.indexOf(status);
      if (idx >= 1) log.push({ d: iso(-Math.max(ago - 1, 0)), t: "Submitted for legal review" });
      if (idx >= 2) log.push({ d: iso(-Math.max(ago - 2, 0)), t: "Approved by Legal and sent to client for signature by email and WhatsApp" });
      if (idx >= 3) log.push({ d: iso(-Math.max(ago - 3, 0)), t: "Signed electronically by client; contract executed" });
      return { id: id, type: type, client: client, property: property, value: value, status: status,
        created: iso(-ago), expires: exp === null ? "" : iso(exp), owner: owner, log: log };
    }
    var chioma = "Barr. Chioma Okonkwo", tolu = "Tolu Adebayo";
    return [
      c("CT-2046", "Offer Letter", "Zainab Ahmed-Bello", "Unit 4B, Lekki Pearl Manor", 135000000, "Sent for Signature", 4, 3, chioma),
      c("CT-2045", "Power of Attorney", "Ayotunde & Bisi Coker", "Plot 08, Maitama Hills", 220000000, "Draft", 1, null, tolu),
      c("CT-2044", "Sale Agreement", "Hajia Amina Dambazau", "Unit 4B, Lekki Pearl Manor", 135000000, "Legal Review", 3, null, chioma),
      c("CT-2043", "Allocation Letter", "Dr. Babatunde Adeleke", "Plot 14B, Green Valley Estate", 6500000, "Draft", 1, null, chioma),
      c("CT-2042", "Offer Letter", "Dr. Babatunde Adeleke", "Plot 14B, Green Valley Estate", 6500000, "Executed", 14, null, chioma),
      c("CT-2041", "Sale Agreement", "Dr. Babatunde Adeleke", "Plot 14B, Green Valley Estate", 6500000, "Sent for Signature", 5, null, chioma),
      c("CT-2038", "Deed of Assignment", "Flutterwave Tech Hub Ltd", "Horizon Commercial Heights, VI", 192000000, "Executed", 32, null, chioma),
      c("CT-2036", "Sale Agreement", "Col. Ibrahim Bello (Rtd)", "Lekki Pearl Manor (Unit 031)", 110000000, "Executed", 40, null, tolu),
      c("CT-2035", "Governor's Consent / C of O", "Kunle Sorinola Holdings", "Alausa Commercial Plot 12", 310000000, "Executed", 55, null, chioma)
    ];
  }

  var Contracts = {
    _c: null,
    all: function () {
      if (!this._c) this._c = readStore(CONTRACT_KEY) || seedContracts();
      return this._c;
    },
    save: function () { writeStore(CONTRACT_KEY, this._c); },
    get: function (id) { return this.all().filter(function (c) { return c.id === id; })[0]; },
    forClient: function (name) { return this.all().filter(function (c) { return c.client === name; }); },
    nextId: function () {
      var max = 2000;
      this.all().forEach(function (c) { max = Math.max(max, parseInt(c.id.replace("CT-", ""), 10) || 0); });
      return "CT-" + (max + 1);
    },
    add: function (c) { this.all().unshift(c); this.save(); },
    advance: function (id, note) {
      var c = this.get(id);
      var i = STAGES.indexOf(c.status);
      if (i >= 0 && i < STAGES.length - 1) {
        c.status = STAGES[i + 1];
        c.log.push({ d: iso(0), t: note });
        this.save();
      }
      return c;
    }
  };

  var EXP_CATEGORIES = ["Fuel & Diesel", "Transport", "Site Visit", "Survey & Mapping", "Legal & Documentation",
    "Security", "Utilities", "Maintenance & Repairs", "Client Hospitality", "Airtime & Data", "Office Supplies"];
  var EXP_SITES = ["Green Valley Estate", "Lekki Pearl Manor", "Horizon Commercial Heights", "Maitama Hills",
    "Alausa Commercial", "Head Office"];
  var EXP_STATUS_CLS = {
    "Pending": "bg-amber-50 text-amber-900",
    "Approved": "bg-emerald-50 text-emerald-800",
    "Rejected": "bg-error-container text-on-error-container"
  };

  function seedExpenses() {
    function e(id, ago, staff, cat, site, desc, amount, status, receipt, note) {
      return { id: id, date: iso(-ago), staff: staff, category: cat, site: site, desc: desc, amount: amount,
        status: status, receipt: receipt, note: note || "" };
    }
    return [
      e("EX-1034", 1, "Dapo Alabi", "Transport", "Lekki Pearl Manor", "Taxi to and from client inspection, Lekki", 18000, "Pending", "taxi-receipt.jpg"),
      e("EX-1033", 1, "Femi Ezechukwu", "Fuel & Diesel", "Green Valley Estate", "Generator diesel for site office (200 litres)", 340000, "Pending", "diesel-invoice.pdf"),
      e("EX-1032", 2, "Adaeze Chukwuma", "Site Visit", "Lekki Pearl Manor", "Client site inspection day, 4 clients (transport and refreshments)", 45000, "Pending", "visit-costs.pdf"),
      e("EX-1031", 3, "Femi Ezechukwu", "Security", "Green Valley Estate", "Night guard top-up for October", 120000, "Pending", "guard-invoice.pdf"),
      e("EX-1030", 5, "Sani Oseni", "Transport", "Maitama Hills", "Road transport to Abuja site, return trip", 68000, "Approved", "transport.pdf"),
      e("EX-1029", 6, "Femi Ezechukwu", "Survey & Mapping", "Green Valley Estate", "Boundary re-pegging, surveyor fee", 250000, "Approved", "surveyor-invoice.pdf"),
      e("EX-1028", 8, "Barr. Chioma Okonkwo", "Legal & Documentation", "Alausa Commercial", "Registration and consent processing fees", 180000, "Approved", "receipt-8841.pdf"),
      e("EX-1027", 9, "Adaeze Chukwuma", "Client Hospitality", "Head Office", "Client lunch at offer signing", 38500, "Rejected", "", "Receipt missing. Please attach and resubmit."),
      e("EX-1026", 11, "Bilikisu Olatunji", "Transport", "Lekki Pearl Manor", "Fuel allowance for site tour", 22000, "Approved", "fuel-slip.jpg"),
      e("EX-1025", 13, "Amina Bello", "Airtime & Data", "Head Office", "Office data subscription", 30000, "Approved", "data-receipt.pdf"),
      e("EX-1024", 15, "Dapo Alabi", "Fuel & Diesel", "Lekki Pearl Manor", "Fuel for client pickups", 25000, "Approved", "fuel-slip.jpg")
    ];
  }

  var Expenses = {
    _e: null,
    all: function () {
      if (!this._e) this._e = readStore(EXPENSE_KEY) || seedExpenses();
      return this._e;
    },
    save: function () { writeStore(EXPENSE_KEY, this._e); },
    get: function (id) { return this.all().filter(function (x) { return x.id === id; })[0]; },
    nextId: function () {
      var max = 1000;
      this.all().forEach(function (x) { max = Math.max(max, parseInt(x.id.replace("EX-", ""), 10) || 0); });
      return "EX-" + (max + 1);
    }
  };

  var contractFilter = "All";
  var contractQuery = "";
  var expenseFilter = "All";

  function renderContractList() {
    var body = byId("contractsBody");
    if (!body) return;
    var all = Contracts.all();
    var inProgress = all.filter(function (c) { return c.status === "Draft" || c.status === "Legal Review"; }).length;
    var awaiting = all.filter(function (c) { return c.status === "Sent for Signature"; });
    var expiring = awaiting.filter(function (c) { return c.expires && daysLeft(c.expires) <= 7; }).length;
    setText("ctKpiTotal", all.length);
    setText("ctKpiProgress", inProgress);
    setText("ctKpiAwaiting", awaiting.length);
    setText("ctKpiAwaitingNote", expiring ? expiring + " offer expiring within 7 days" : "None expiring soon");
    setText("ctKpiExecuted", all.filter(function (c) { return c.status === "Executed"; }).length);
    setText("ctKpiValue", money(all.filter(function (c) { return c.status === "Executed"; })
      .reduce(function (s, c) { return s + c.value; }, 0)) + " executed value");

    var chips = byId("ctFilters");
    if (chips) {
      chips.innerHTML = ["All"].concat(STAGES).map(function (s) {
        var n = s === "All" ? all.length : all.filter(function (c) { return c.status === s; }).length;
        var on = s === contractFilter;
        return '<button class="px-space-12 py-space-4 rounded-full font-label-md text-label-md font-semibold whitespace-nowrap transition-colors ' +
          (on ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high") +
          '" onclick="Estate360.contractSetFilter(\'' + s + '\')" type="button">' + s + " (" + n + ")</button>";
      }).join("");
    }

    var q = contractQuery.toLowerCase();
    var rows = all.filter(function (c) {
      if (contractFilter !== "All" && c.status !== contractFilter) return false;
      if (!q) return true;
      return (c.id + " " + c.type + " " + c.client + " " + c.property).toLowerCase().indexOf(q) !== -1;
    });
    body.innerHTML = rows.length ? rows.map(function (c) {
      return '<tr class="h-16 hover:bg-surface-container-low transition-colors cursor-pointer" onclick="location.href=\'contract-detail.html?id=' + c.id + '\'">' +
        '<td class="px-space-20 py-space-12 font-financial-tabular font-semibold text-primary">' + c.id + "</td>" +
        '<td class="px-space-16 py-space-12 font-body-md text-body-md text-on-surface font-medium">' + c.type + "</td>" +
        '<td class="px-space-16 py-space-12"><a class="font-body-md text-body-md text-on-surface font-semibold hover:text-primary hover:underline" href="client-profile.html" onclick="event.stopPropagation()">' + c.client + "</a></td>" +
        '<td class="px-space-16 py-space-12 font-body-sm text-body-sm text-on-surface-variant">' + c.property + "</td>" +
        '<td class="px-space-16 py-space-12 text-right font-financial-tabular font-bold text-on-surface">' + money(c.value) + "</td>" +
        '<td class="px-space-16 py-space-12">' + statusBadge(c.status) + expiryNote(c) + "</td>" +
        '<td class="px-space-16 py-space-12 font-financial-tabular text-on-surface-variant">' + fmtDate(c.created) + "</td>" +
        '<td class="px-space-20 py-space-12 text-center"><span class="material-symbols-outlined text-[20px] text-primary">chevron_right</span></td></tr>';
    }).join("") : '<tr><td colspan="8" class="px-space-20 py-space-24 text-center font-body-md text-on-surface-variant">No contracts match your filter.</td></tr>';
  }

  function renderClientContracts(containerId, clientName) {
    var box = byId(containerId);
    if (!box) return;
    var list = Contracts.forClient(clientName);
    box.innerHTML =
      '<div class="flex items-center justify-between">' +
      '<h2 class="font-title-sm text-title-sm font-bold text-on-surface">Contracts</h2>' +
      '<span class="px-space-8 py-0.5 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm font-bold">' + list.length + "</span></div>" +
      (list.length ? list.map(function (c) {
        return '<a class="p-space-12 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors flex flex-col gap-space-4" href="contract-detail.html?id=' + c.id + '">' +
          '<div class="flex items-center justify-between gap-space-8"><span class="font-body-md text-body-md font-bold text-on-surface">' + c.type + "</span>" + statusBadge(c.status) + "</div>" +
          '<span class="font-body-sm text-body-sm text-on-surface-variant">' + c.id + " · " + c.property + "</span></a>";
      }).join("") : '<p class="font-body-sm text-body-sm text-on-surface-variant">No contracts yet for this client.</p>') +
      '<a class="font-label-md text-label-md text-primary font-semibold hover:underline" href="legal.html?new=1&client=' + encodeURIComponent(clientName) + '">Draft a new contract →</a>';
  }

  function renderContractDetail() {
    var root = byId("contractDetailRoot");
    if (!root) return;
    var id = new URLSearchParams(location.search).get("id") || "CT-2041";
    var c = Contracts.get(id) || Contracts.all()[0];
    var client = CLIENTS.filter(function (x) { return x.name === c.client; })[0] || { id: "—", email: "—", phone: "—" };
    var idx = STAGES.indexOf(c.status);
    var related = Contracts.forClient(c.client).filter(function (x) { return x.id !== c.id; });

    var stepper = STAGES.map(function (s, i) {
      var done = i < idx, now = i === idx;
      var dot = done ? "bg-primary text-on-primary" : (now ? "bg-primary-container text-on-primary ring-4 ring-primary/20" : "bg-surface-container-high text-on-surface-variant");
      var inner = done ? '<span class="material-symbols-outlined text-[18px]">check</span>' : (i + 1);
      return '<div class="flex-1 flex flex-col items-center gap-space-8 relative min-w-[84px]">' +
        (i > 0 ? '<span class="absolute top-4 right-1/2 w-full h-0.5 ' + (i <= idx ? "bg-primary" : "bg-outline-variant/60") + '"></span>' : "") +
        '<span class="relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-label-md text-label-md font-bold ' + dot + '">' + inner + "</span>" +
        '<span class="font-label-md text-label-md text-center ' + (now ? "text-on-surface font-bold" : "text-on-surface-variant") + '">' + s + "</span></div>";
    }).join("");

    var action;
    if (c.status === "Draft") {
      action = '<div class="flex flex-col gap-space-4"><span class="font-title-sm text-title-sm font-bold text-on-surface">Next step: legal review</span><span class="font-body-sm text-body-sm text-on-surface-variant">The draft is ready. Send it into the legal review queue for checking before it goes to the client.</span></div>' +
        '<button class="h-10 px-space-16 rounded-lg bg-primary text-on-primary font-title-sm text-title-sm shadow-sm hover:bg-primary-container transition-colors flex-shrink-0" onclick="Estate360.contractAdvance(\'' + c.id + '\')" type="button">Submit for Legal Review</button>';
    } else if (c.status === "Legal Review") {
      action = '<div class="flex flex-col gap-space-4"><span class="font-title-sm text-title-sm font-bold text-on-surface">Next step: approve and send</span><span class="font-body-sm text-body-sm text-on-surface-variant">Once Legal is satisfied, approve it. The client receives it by email and WhatsApp to sign.</span></div>' +
        '<button class="h-10 px-space-16 rounded-lg bg-primary text-on-primary font-title-sm text-title-sm shadow-sm hover:bg-primary-container transition-colors flex-shrink-0" onclick="Estate360.contractAdvance(\'' + c.id + '\')" type="button">Approve &amp; Send for Signature</button>';
    } else if (c.status === "Sent for Signature") {
      action = '<div class="flex flex-col gap-space-4"><span class="font-title-sm text-title-sm font-bold text-on-surface">Waiting for ' + c.client + ' to sign</span><span class="font-body-sm text-body-sm text-on-surface-variant">Sent to ' + client.email + ' and WhatsApp.' + (c.expires ? " Offer valid until " + fmtDate(c.expires) + "." : "") + '</span></div>' +
        '<button class="h-10 px-space-16 rounded-lg bg-primary text-on-primary font-title-sm text-title-sm shadow-sm hover:bg-primary-container transition-colors flex-shrink-0" onclick="Estate360.contractToggleSign()" type="button">Capture E-Signature</button>';
    } else {
      action = '<div class="flex flex-col gap-space-4"><span class="font-title-sm text-title-sm font-bold text-on-surface">Contract executed</span><span class="font-body-sm text-body-sm text-on-surface-variant">Signed and filed. A copy is saved to the client record.</span></div>' +
        '<button class="h-10 px-space-16 rounded-lg bg-surface-container-low text-on-surface font-title-sm text-title-sm hover:bg-surface-container transition-colors flex-shrink-0 flex items-center gap-space-8" onclick="Estate360.contractDownload(\'' + c.id + '\')" type="button"><span class="material-symbols-outlined text-[18px] text-outline">download</span>Download Signed Copy</button>';
    }

    var versions = [
      { n: "Final.pdf", d: "Latest version", show: idx >= 2 },
      { n: "Reviewed by Legal.pdf", d: "Legal-approved version", show: idx >= 1 },
      { n: "Draft v1.docx", d: "Initial draft", show: true }
    ].filter(function (v) { return v.show; });

    function field(label, val) {
      return '<div class="flex flex-col gap-space-2"><span class="font-label-sm text-label-sm text-outline uppercase tracking-wider">' + label +
        '</span><span class="font-body-md text-body-md text-on-surface">' + val + "</span></div>";
    }
    function card(inner, extra) {
      return '<div class="bg-surface-container-lowest rounded-lg shadow-sm p-space-20 flex flex-col gap-space-16 ' + (extra || "") + '">' + inner + "</div>";
    }

    root.innerHTML =
      '<a class="flex items-center gap-space-4 font-label-md text-label-md font-semibold text-on-surface-variant hover:text-primary transition-colors self-start" href="legal.html"><span class="material-symbols-outlined text-[18px]">arrow_back</span><span>Back to Contracts</span></a>' +
      card('<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-16"><div class="flex items-center gap-space-16">' +
        '<span class="w-12 h-12 rounded-lg bg-primary-container/10 text-primary flex items-center justify-center"><span class="material-symbols-outlined text-[26px]">gavel</span></span>' +
        '<div class="flex flex-col"><h1 class="font-headline-lg text-headline-lg text-on-surface tracking-tight">' + c.type + '</h1><span class="font-body-md text-body-md text-on-surface-variant">' + c.id + " · " + c.property + "</span></div></div>" +
        '<div class="flex items-center gap-space-8">' + statusBadge(c.status) + "</div></div>") +
      card('<div class="flex items-start justify-between overflow-x-auto pb-space-4">' + stepper + "</div>") +
      card('<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-16">' + action + "</div>" +
        '<div id="signPanel" class="flex-col gap-space-12 border-t border-outline-variant/60 pt-space-16" style="display:none">' +
        '<span class="font-title-sm text-title-sm font-bold text-on-surface">Client e-signature</span>' +
        '<label class="flex flex-col gap-space-4"><span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Type full name to sign</span>' +
        '<input id="signName" class="h-11 px-space-12 rounded-lg border border-outline-variant bg-surface-container-lowest font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30" type="text" value="' + c.client + '"/></label>' +
        '<label class="flex items-start gap-space-8 font-body-sm text-body-sm text-on-surface-variant"><input id="signAgree" class="mt-0.5" type="checkbox"/><span>The client confirms they have read and agree to the terms of this ' + c.type + ".</span></label>" +
        '<button class="h-10 px-space-16 rounded-lg bg-primary text-on-primary font-title-sm text-title-sm shadow-sm hover:bg-primary-container transition-colors self-start" onclick="Estate360.contractConfirmSign(\'' + c.id + '\')" type="button">Confirm Signature</button></div>') +
      '<div class="grid grid-cols-1 lg:grid-cols-3 gap-space-16">' +
      '<div class="lg:col-span-2 flex flex-col gap-space-16">' +
      card('<span class="font-title-sm text-title-sm font-bold text-on-surface">Contract Details</span><div class="grid grid-cols-1 sm:grid-cols-2 gap-space-16">' +
        field("Contract type", c.type) + field("Contract value", '<span class="font-financial-tabular font-semibold">' + money(c.value) + "</span>") +
        field("Prepared by", c.owner) + field("Date created", fmtDate(c.created)) +
        field("Offer validity", c.expires ? fmtDate(c.expires) : "Not applicable") +
        field("Payment plan", "Installment plan per allocation") + "</div>") +
      card('<span class="font-title-sm text-title-sm font-bold text-on-surface">Documents</span>' + versions.map(function (v) {
        return '<div class="flex items-center justify-between p-space-12 rounded-lg bg-surface-container-low"><div class="flex items-center gap-space-12"><span class="material-symbols-outlined text-primary text-[22px]">description</span><div class="flex flex-col"><span class="font-body-md text-body-md text-on-surface font-medium">' + v.n + '</span><span class="font-label-sm text-label-sm text-outline">' + v.d + '</span></div></div><button class="font-label-sm text-label-sm text-primary font-semibold hover:underline" onclick="Estate360.contractDownload(\'' + c.id + '\')" type="button">Download</button></div>';
      }).join("")) +
      card('<span class="font-title-sm text-title-sm font-bold text-on-surface">Activity</span><div class="flex flex-col gap-space-12">' +
        c.log.slice().reverse().map(function (l) {
          return '<div class="flex items-start gap-space-12"><span class="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span><div class="flex flex-col"><span class="font-body-md text-body-md text-on-surface">' + l.t + '</span><span class="font-label-sm text-label-sm text-outline">' + fmtDate(l.d) + "</span></div></div>";
        }).join("") + "</div>") +
      "</div>" +
      '<div class="flex flex-col gap-space-16">' +
      card('<span class="font-title-sm text-title-sm font-bold text-on-surface">Linked Client</span>' +
        '<div class="flex flex-col gap-space-4"><span class="font-body-md text-body-md font-bold text-on-surface">' + c.client + '</span><span class="font-body-sm text-body-sm text-on-surface-variant">' + client.id + " · " + client.email + "</span><span class=\"font-body-sm text-body-sm text-on-surface-variant\">" + client.phone + "</span></div>" +
        '<a class="font-label-md text-label-md text-primary font-semibold hover:underline" href="client-profile.html">View client profile →</a>') +
      card('<span class="font-title-sm text-title-sm font-bold text-on-surface">Linked Property</span>' +
        '<div class="flex flex-col gap-space-4"><span class="font-body-md text-body-md font-bold text-on-surface">' + c.property + '</span><span class="font-financial-tabular text-body-sm font-semibold text-on-surface-variant">' + money(c.value) + "</span></div>" +
        '<a class="font-label-md text-label-md text-primary font-semibold hover:underline" href="plot-detail.html">View property →</a>') +
      card('<span class="font-title-sm text-title-sm font-bold text-on-surface">Other contracts for this client</span>' +
        (related.length ? related.map(function (x) {
          return '<a class="p-space-12 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between gap-space-8" href="contract-detail.html?id=' + x.id + '"><span class="font-body-md text-body-md text-on-surface font-medium">' + x.type + "</span>" + statusBadge(x.status) + "</a>";
        }).join("") : '<p class="font-body-sm text-body-sm text-on-surface-variant">This is the only contract on file for this client.</p>')) +
      "</div></div>";
  }

  function renderExpenses() {
    var all = Expenses.all();
    var live = all.filter(function (x) { return x.status !== "Rejected"; });
    var pending = all.filter(function (x) { return x.status === "Pending"; });
    var approved = all.filter(function (x) { return x.status === "Approved"; });
    var totals = {};
    live.forEach(function (x) { totals[x.category] = (totals[x.category] || 0) + x.amount; });
    var cats = Object.keys(totals).sort(function (a, b) { return totals[b] - totals[a]; });

    if (byId("expBody")) {
      setText("expKpiTotal", money(live.reduce(function (s, x) { return s + x.amount; }, 0)));
      setText("expKpiTotalNote", live.length + " expenses logged");
      setText("expKpiPending", pending.length);
      setText("expKpiPendingNote", money(pending.reduce(function (s, x) { return s + x.amount; }, 0)) + " awaiting approval");
      setText("expKpiApproved", money(approved.reduce(function (s, x) { return s + x.amount; }, 0)));
      setText("expKpiApprovedNote", approved.length + " approved");
      setText("expKpiTop", cats[0] || "—");
      setText("expKpiTopNote", cats[0] ? money(totals[cats[0]]) : "");

      var chips = byId("expFilters");
      if (chips) {
        chips.innerHTML = ["All", "Pending", "Approved", "Rejected"].map(function (s) {
          var n = s === "All" ? all.length : all.filter(function (x) { return x.status === s; }).length;
          var on = s === expenseFilter;
          return '<button class="px-space-12 py-space-4 rounded-full font-label-md text-label-md font-semibold whitespace-nowrap transition-colors ' +
            (on ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high") +
            '" onclick="Estate360.expSetFilter(\'' + s + '\')" type="button">' + s + " (" + n + ")</button>";
        }).join("");
      }
      var rows = all.filter(function (x) { return expenseFilter === "All" || x.status === expenseFilter; });
      byId("expBody").innerHTML = rows.length ? rows.map(function (x) {
        var actions = x.status === "Pending"
          ? '<div class="flex items-center justify-center gap-space-4">' +
            '<button class="px-space-8 py-1 rounded-md bg-primary text-on-primary font-label-sm text-label-sm font-semibold hover:bg-primary-container transition-colors" onclick="Estate360.decideExpense(\'' + x.id + '\',\'Approved\')" type="button">Approve</button>' +
            '<button class="px-space-8 py-1 rounded-md bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm font-semibold hover:bg-surface-container-high transition-colors" onclick="Estate360.decideExpense(\'' + x.id + '\',\'Rejected\')" type="button">Reject</button></div>'
          : '<span class="font-label-sm text-label-sm text-outline">' + (x.note ? x.note : "—") + "</span>";
        return '<tr class="hover:bg-surface-container-low transition-colors">' +
          '<td class="px-space-20 py-space-12 font-financial-tabular text-on-surface-variant whitespace-nowrap">' + fmtDate(x.date) + "</td>" +
          '<td class="px-space-16 py-space-12 font-body-md text-body-md text-on-surface font-medium">' + x.staff + "</td>" +
          '<td class="px-space-16 py-space-12"><span class="inline-flex px-2.5 py-0.5 rounded-full bg-secondary-fixed/50 text-on-secondary-fixed-variant font-label-sm text-label-sm font-semibold whitespace-nowrap">' + x.category + "</span></td>" +
          '<td class="px-space-16 py-space-12 font-body-sm text-body-sm text-on-surface-variant">' + x.site + "</td>" +
          '<td class="px-space-16 py-space-12 font-body-sm text-body-sm text-on-surface-variant min-w-[160px]">' + x.desc + (x.receipt ? ' <span class="material-symbols-outlined text-[14px] align-middle text-primary" title="' + x.receipt + '">attach_file</span>' : "") + "</td>" +
          '<td class="px-space-16 py-space-12 text-right font-financial-tabular font-bold text-on-surface whitespace-nowrap">' + money(x.amount) + "</td>" +
          '<td class="px-space-16 py-space-12"><span class="inline-flex px-2.5 py-0.5 rounded-full ' + EXP_STATUS_CLS[x.status] + ' font-label-sm text-label-sm font-semibold">' + x.status + "</span></td>" +
          '<td class="px-space-16 py-space-12 text-center">' + actions + "</td></tr>";
      }).join("") : '<tr><td colspan="8" class="px-space-20 py-space-24 text-center font-body-md text-on-surface-variant">No expenses in this view.</td></tr>';

      var bd = byId("expBreakdown");
      if (bd) {
        var max = totals[cats[0]] || 1;
        bd.innerHTML = cats.map(function (k) {
          return '<div class="flex flex-col gap-space-4"><div class="flex items-center justify-between"><span class="font-body-sm text-body-sm text-on-surface">' + k +
            '</span><span class="font-financial-tabular text-body-sm font-semibold text-on-surface">' + money(totals[k]) + "</span></div>" +
            '<div class="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden"><div class="h-full bg-primary-container rounded-full" style="width:' + Math.round(totals[k] / max * 100) + '%"></div></div></div>';
        }).join("");
      }
    }

    var mine = byId("myExpBody");
    if (mine) {
      var me = currentRoleName();
      var my = all.filter(function (x) { return x.staff === me; });
      mine.innerHTML = my.length ? my.map(function (x) {
        return '<tr class="h-14 hover:bg-surface-container-low transition-colors">' +
          '<td class="px-space-20 py-space-12 font-financial-tabular text-on-surface-variant whitespace-nowrap">' + fmtDate(x.date) + "</td>" +
          '<td class="px-space-16 py-space-12 font-body-md text-body-md text-on-surface font-medium">' + x.category + "</td>" +
          '<td class="px-space-16 py-space-12 font-body-sm text-body-sm text-on-surface-variant">' + x.desc + "</td>" +
          '<td class="px-space-16 py-space-12 text-right font-financial-tabular font-bold text-on-surface">' + money(x.amount) + "</td>" +
          '<td class="px-space-20 py-space-12 text-center"><span class="inline-flex px-2.5 py-0.5 rounded-full ' + EXP_STATUS_CLS[x.status] + ' font-label-sm text-label-sm font-semibold">' + x.status + "</span></td></tr>";
      }).join("") : '<tr><td colspan="5" class="px-space-20 py-space-24 text-center font-body-md text-on-surface-variant">You have not submitted any expenses yet.</td></tr>';
    }
  }

  function fillSelect(id, items, selected) {
    var el = byId(id);
    if (!el || el.options.length) return;
    el.innerHTML = items.map(function (i) {
      var v = typeof i === "string" ? i : i.name;
      return '<option' + (v === selected ? " selected" : "") + ">" + v + "</option>";
    }).join("");
  }

  function initDemoData() {
    renderContractList();
    renderContractDetail();
    renderExpenses();
    renderClientContracts("clientContracts", "Dr. Babatunde Adeleke");
    fillSelect("ctClient", CLIENTS);
    fillSelect("ctType", CONTRACT_TYPES);
    fillSelect("ctProperty", PROPERTIES);
    ["expCategory", "myExpCategory"].forEach(function (id) { fillSelect(id, EXP_CATEGORIES); });
    ["expSite", "myExpSite"].forEach(function (id) { fillSelect(id, EXP_SITES); });
    ["expDate", "myExpDate"].forEach(function (id) { var el = byId(id); if (el && !el.value) el.value = iso(0); });
    var q = new URLSearchParams(location.search);
    if (q.get("new") && byId("newContractPanel")) {
      byId("newContractPanel").style.display = "flex";
      if (q.get("client") && byId("ctClient")) byId("ctClient").value = q.get("client");
    }
  }

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

    /* ---- contracts (Legal) ---- */
    contractSetFilter: function (s) { contractFilter = s; renderContractList(); },
    contractSearch: function (v) { contractQuery = v || ""; renderContractList(); },
    toggleNewContract: function () {
      var p = byId("newContractPanel");
      if (p) p.style.display = p.style.display === "flex" ? "none" : "flex";
    },
    submitNewContract: function (event, form) {
      event.preventDefault();
      var f = form.elements;
      var type = f.type.value;
      var value = parseInt(String(f.value.value).replace(/[^0-9]/g, ""), 10) || 0;
      var c = { id: Contracts.nextId(), type: type, client: f.client.value, property: f.property.value, value: value,
        status: "Draft", created: iso(0), expires: type === "Offer Letter" ? iso(14) : "", owner: currentRoleName(),
        log: [{ d: iso(0), t: "Draft created by " + currentRoleName() }] };
      Contracts.add(c);
      form.reset();
      byId("newContractPanel").style.display = "none";
      contractFilter = "All";
      renderContractList();
      toast(c.type + " drafted for " + c.client + " and linked to their client record.", {
        variant: "success", title: c.id + " created", duration: 5000 });
    },
    contractAdvance: function (id) {
      var c = Contracts.get(id);
      var notes = {
        "Draft": ["Submitted for legal review", "Contract is now in the legal review queue."],
        "Legal Review": ["Approved by Legal and sent to client for signature by email and WhatsApp", "Approved. The client has been sent a signing link by email and WhatsApp."]
      };
      var n = notes[c.status];
      if (!n) return;
      Contracts.advance(id, n[0]);
      renderContractDetail();
      toast(n[1], { variant: "success", title: "Status updated", duration: 4000 });
    },
    contractToggleSign: function () {
      var p = byId("signPanel");
      if (p) p.style.display = p.style.display === "flex" ? "none" : "flex";
    },
    contractConfirmSign: function (id) {
      var agree = byId("signAgree"), name = byId("signName");
      if (!name || !name.value.trim()) { toast("Type the client's full name to sign.", { variant: "info", title: "Signature needed" }); return; }
      if (!agree || !agree.checked) { toast("Tick the confirmation box to continue.", { variant: "info", title: "Confirmation needed" }); return; }
      Contracts.advance(id, "Signed electronically by " + name.value.trim() + "; contract executed");
      renderContractDetail();
      toast("Signature captured. The signed copy is saved to the client record.", { variant: "success", title: "Contract executed", duration: 5000 });
    },
    contractDownload: function (id) {
      toast("Downloading " + id + " (demo build, no file is generated).", { variant: "info", title: "Download" });
    },

    /* ---- expenses (Finance + employee self-service) ---- */
    toggleExpenseForm: function () {
      var p = byId("expFormPanel");
      if (p) p.style.display = p.style.display === "flex" ? "none" : "flex";
    },
    expSetFilter: function (s) { expenseFilter = s; renderExpenses(); },
    submitExpense: function (event, form, scope) {
      event.preventDefault();
      var f = form.elements;
      var file = f.receipt && f.receipt.files && f.receipt.files[0];
      var x = { id: Expenses.nextId(), date: f.date.value || iso(0), staff: currentRoleName(), category: f.category.value,
        site: f.site.value, desc: f.desc.value.trim() || f.category.value, amount: parseInt(String(f.amount.value).replace(/[^0-9]/g, ""), 10) || 0,
        status: "Pending", receipt: file ? file.name : "", note: "" };
      Expenses.all().unshift(x);
      Expenses.save();
      form.reset();
      var dateEl = f.date; if (dateEl) dateEl.value = iso(0);
      if (scope === "finance") byId("expFormPanel").style.display = "none";
      expenseFilter = "All";
      renderExpenses();
      toast(money(x.amount) + " for " + x.category + " has been sent to Accounts for approval.", {
        variant: "success", title: x.id + " submitted", duration: 5000 });
    },
    decideExpense: function (id, decision) {
      var x = Expenses.get(id);
      if (!x) return;
      x.status = decision;
      if (decision === "Rejected") x.note = "Rejected by Accounts. Please check the receipt and resubmit.";
      Expenses.save();
      renderExpenses();
      toast(x.staff + "'s " + x.category.toLowerCase() + " expense (" + money(x.amount) + ") was " + decision.toLowerCase() + ".", {
        variant: decision === "Approved" ? "success" : "info", title: "Expense " + decision.toLowerCase() });
    },
    exportExpenses: function () {
      toast("Expense report exported (demo build, no file is generated).", { variant: "info", title: "Export" });
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
    initDemoData();
  });
})();
