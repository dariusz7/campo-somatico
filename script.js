// Clave de Web3Forms (https://web3forms.com). Es pública por diseño: va en el HTML del sitio.
const WEB3FORMS_KEY = "";

const form = document.getElementById("form");
const status = form.querySelector(".status");
const button = form.querySelector("button[type=submit]");

function show(kind, html) {
  status.className = "status " + kind;
  status.innerHTML = html;
}

function validate() {
  let ok = true;
  form.querySelectorAll("input[required]").forEach((input) => {
    const bad = !input.value.trim() || (input.type === "email" && !input.checkValidity());
    input.setAttribute("aria-invalid", bad ? "true" : "false");
    if (bad) ok = false;
  });
  return ok;
}

form.querySelectorAll("input").forEach((input) =>
  input.addEventListener("input", () => input.removeAttribute("aria-invalid"))
);

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!validate()) {
    show("err", "Revisa los campos marcados: nombre, un email válido y país.");
    form.querySelector('[aria-invalid="true"]').focus();
    return;
  }
  if (!WEB3FORMS_KEY) {
    show("err", "Estamos terminando de conectar este formulario. Vuelve a intentarlo en unos días, por favor.");
    return;
  }

  const data = Object.fromEntries(new FormData(form));
  data.access_key = WEB3FORMS_KEY;
  data.botcheck = form.botcheck.checked;

  button.disabled = true;
  button.textContent = "Enviando…";
  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || res.status);
    form.classList.add("sent");
    const nombre = (data.name || "").trim().split(" ")[0];
    show("ok", `<b>¡Gracias${nombre ? ", " + nombre.replace(/[<>&]/g, "") : ""}!</b>Recibimos tus datos. Te escribiremos pronto para conversar.`);
  } catch (err) {
    show("err", "No pudimos enviar el formulario. Revisa tu conexión y vuelve a intentarlo.");
  } finally {
    button.disabled = false;
    button.textContent = "Quiero sumarme";
  }
});
