const cfg = window.NISHI_CONFIG || {};
const configured = Boolean(
  cfg.SUPABASE_URL &&
  cfg.SUPABASE_PUBLISHABLE_KEY &&
  !cfg.SUPABASE_URL.includes("YOUR_") &&
  !cfg.SUPABASE_PUBLISHABLE_KEY.includes("YOUR_")
);

const authOverlay = document.getElementById("authOverlay");
const authError = document.getElementById("authError");
const setupBanner = document.getElementById("setupBanner");
const cloudBadge = document.getElementById("cloudBadge");
const cloudStatus = document.getElementById("cloudStatus");
const userChip = document.getElementById("userChip");
const signOutBtn = document.getElementById("signOutBtn");
const storageNote = document.getElementById("storageNote");
const loginBtn = document.getElementById("loginBtn");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");

let supabase = null;
let cloudUser = null;
let cloudBills = [];
let cloudSettings = null;

// Preserve the existing local-only functions as a fallback.
const localSaveBill = window.saveBill;
const localRenderHistory = window.renderHistory;
const localLoadHistory = window.loadHistory;
const localDeleteHistory = window.deleteHistory;
const localNewBill = window.newBill;

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
}

function setCloudUI(mode, email="") {
  cloudBadge.classList.remove("online","local");
  if (mode === "online") {
    cloudBadge.classList.add("online");
    cloudStatus.textContent = "Cloud connected";
    userChip.textContent = email || "";
    signOutBtn.style.display = "";
    storageNote.textContent = "Bills are stored online for this login. Backup is still available as an extra copy.";
  } else {
    cloudBadge.classList.add("local");
    cloudStatus.textContent = "Local mode";
    userChip.textContent = "";
    signOutBtn.style.display = "none";
    storageNote.textContent = "Bills are stored only in this browser/device. Use Backup regularly.";
  }
}

function companySettingsFromForm() {
  return {
    companyEn: document.getElementById("companyEn").value,
    companyMr: document.getElementById("companyMr").value,
    tagline: document.getElementById("tagline").value,
    officeAddress: document.getElementById("officeAddress").value,
    contactLeft: document.getElementById("contactLeft").value,
    phone: document.getElementById("phone").value,
    pan: document.getElementById("pan").value,
    bankName: document.getElementById("bankName").value,
    accountNo: document.getElementById("accountNo").value,
    ifsc: document.getElementById("ifsc").value,
    terms: document.getElementById("terms").value,
    logoData: localStorage.getItem("nishiLogo") || ""
  };
}

async function saveCloudSettings() {
  if (!cloudUser) return;
  const settings = companySettingsFromForm();
  const { error } = await supabase
    .from("company_settings")
    .upsert({
      user_id: cloudUser.id,
      settings,
      updated_at: new Date().toISOString()
    }, { onConflict: "user_id" });
  if (error) throw error;
  cloudSettings = settings;
}

function applyCloudSettings(settings) {
  if (!settings) return;
  const keys = [
    "companyEn","companyMr","tagline","officeAddress","contactLeft","phone",
    "pan","bankName","accountNo","ifsc","terms"
  ];
  keys.forEach(k => {
    const el = document.getElementById(k);
    if (el && settings[k] !== undefined && settings[k] !== null) el.value = settings[k];
  });
  if (settings.logoData && window.setBillLogoData) {
    window.setBillLogoData(settings.logoData);
  }
  window.updatePreview();
}

async function loadCloudSettings() {
  if (!cloudUser) return;
  const { data, error } = await supabase
    .from("company_settings")
    .select("settings")
    .eq("user_id", cloudUser.id)
    .maybeSingle();
  if (error) throw error;
  if (data?.settings) {
    cloudSettings = data.settings;
    applyCloudSettings(data.settings);
  }
}

async function refreshCloudBills() {
  if (!cloudUser) return;
  const { data, error } = await supabase
    .from("bills")
    .select("id,invoice_no,bill_date,customer,payload,created_at,updated_at")
    .order("updated_at", { ascending: false })
    .limit(500);
  if (error) throw error;
  cloudBills = data || [];
  renderCloudHistory();
}

function renderCloudHistory() {
  const history = document.getElementById("history");
  if (!cloudBills.length) {
    history.innerHTML = '<div class="history-item"><span class="small">No saved cloud bills yet.</span></div>';
    return;
  }
  history.innerHTML = cloudBills.map((b,i)=>`
    <div class="history-item">
      <div>
        <b>#${escapeHtml(b.invoice_no || "")}</b>
        ${escapeHtml(b.customer || "")}
        <br><span class="small">${b.bill_date ? formatDate(b.bill_date) : ""}</span>
      </div>
      <div>
        <button onclick="cloudLoadHistory(${i})">Open</button>
        <button onclick="cloudDeleteHistory(${i})">Delete</button>
      </div>
    </div>`).join("");
}

function formatDate(v) {
  if (!v) return "";
  const s = String(v).slice(0,10);
  const [y,m,d] = s.split("-");
  return `${d}/${m}/${y}`;
}

window.saveBill = async function() {
  if (!configured || !cloudUser) {
    return localSaveBill();
  }
  try {
    const data = window.getData();
    const invoiceNo = String(data.invoiceNo || "").trim();
    if (!invoiceNo) {
      alert("Please enter Invoice No.");
      return;
    }

    await saveCloudSettings();

    const row = {
      user_id: cloudUser.id,
      invoice_no: invoiceNo,
      bill_date: data.billDate || null,
      customer: data.customer || "",
      payload: data,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from("bills")
      .upsert(row, { onConflict: "user_id,invoice_no" });

    if (error) throw error;
    await refreshCloudBills();
    alert("Bill saved to cloud.");
  } catch (e) {
    console.error(e);
    alert("Cloud save failed: " + (e.message || e));
  }
};

window.cloudLoadHistory = function(i) {
  const bill = cloudBills[i];
  if (!bill?.payload) return;
  window.setData(bill.payload);
};

window.cloudDeleteHistory = async function(i) {
  const bill = cloudBills[i];
  if (!bill) return;
  if (!confirm(`Delete Bill #${bill.invoice_no}?`)) return;
  const { error } = await supabase.from("bills").delete().eq("id", bill.id);
  if (error) {
    alert("Delete failed: " + error.message);
    return;
  }
  await refreshCloudBills();
};

window.renderHistory = function() {
  if (configured && cloudUser) renderCloudHistory();
  else localRenderHistory();
};

window.loadHistory = function(i) {
  if (configured && cloudUser) return window.cloudLoadHistory(i);
  return localLoadHistory(i);
};

window.deleteHistory = function(i) {
  if (configured && cloudUser) return window.cloudDeleteHistory(i);
  return localDeleteHistory(i);
};

window.newBill = function() {
  if (!configured || !cloudUser || cloudBills.length === 0) return localNewBill();

  const numeric = cloudBills
    .map(b => Number(String(b.invoice_no || "").replace(/\D/g,"")))
    .filter(n => Number.isFinite(n) && n >= 0);

  const next = numeric.length ? Math.max(...numeric) + 1 : 1;
  localNewBill();

  const invoice = document.getElementById("invoiceNo");
  if (invoice) invoice.value = String(next).padStart(3,"0");
  window.updatePreview();
};

window.cloudSignOut = async function() {
  if (!supabase) return;
  await supabase.auth.signOut();
};

async function afterLogin(user) {
  cloudUser = user;
  authOverlay.style.display = "none";
  setupBanner.style.display = "none";
  setCloudUI("online", user.email || "");
  try {
    await loadCloudSettings();
    await refreshCloudBills();
  } catch (e) {
    console.error(e);
    alert("Logged in, but cloud data could not be loaded: " + (e.message || e));
  }
}

async function showLogin() {
  cloudUser = null;
  setCloudUI("local");
  authOverlay.style.display = "flex";
}

if (!configured) {
  setupBanner.style.display = "block";
  authOverlay.style.display = "none";
  setCloudUI("local");
} else {
  try {
    const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
    supabase = createClient(cfg.SUPABASE_URL, cfg.SUPABASE_PUBLISHABLE_KEY);

    loginBtn.addEventListener("click", async () => {
      authError.textContent = "";
      loginBtn.disabled = true;
      loginBtn.textContent = "Logging in...";
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: loginEmail.value.trim(),
          password: loginPassword.value
        });
        if (error) throw error;
        if (data?.user) await afterLogin(data.user);
      } catch (e) {
        authError.textContent = e.message || "Login failed.";
      } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = "Login";
      }
    });

    loginPassword.addEventListener("keydown", e => {
      if (e.key === "Enter") loginBtn.click();
    });

    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session?.user) {
      await afterLogin(sessionData.session.user);
    } else {
      await showLogin();
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        await showLogin();
      } else if (session?.user && cloudUser?.id !== session.user.id) {
        await afterLogin(session.user);
      }
    });
  } catch (e) {
    console.error(e);
    authError.textContent = "Cloud library could not load. Check internet connection.";
    authOverlay.style.display = "flex";
  }
}

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("./sw.js").catch(()=>{});
}
