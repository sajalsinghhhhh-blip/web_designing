/* GL Bajaj Online Book Store - shared script */
const $ = id => document.getElementById(id);
const BOOKS = [
 {id:1,title:"XML Bible",author:"Winston",pub:"Wiley",price:40.5,branch:"CSE",color:"#8a2c2c"},
 {id:2,title:"Artificial Intelligence",author:"S. Russel",pub:"Princeton Hall",price:63,branch:"CSE",color:"#2c5a8a"},
 {id:3,title:"Java 2",author:"Watson",pub:"BPB Publications",price:35.5,branch:"CSE",color:"#2c6b4a"},
 {id:4,title:"HTML in 24 Hours",author:"Sam Peter",pub:"Sam Publication",price:50,branch:"CSE",color:"#6b4a8a"},
 {id:5,title:"Electronic Devices and Circuits",author:"Boylestad",pub:"Pearson",price:45,branch:"ECE",color:"#8a5a2c"},
 {id:6,title:"Electrical Machines",author:"Nagrath",pub:"McGraw Hill",price:38,branch:"EEE",color:"#2c7a8a"},
 {id:7,title:"Strength of Materials",author:"R.K. Bansal",pub:"Laxmi Publications",price:32,branch:"CIVIL",color:"#5a5a5a"}
];
const getCart = () => JSON.parse(localStorage.getItem("cart") || "{}");
const saveCart = c => localStorage.setItem("cart", JSON.stringify(c));
const money = n => "$" + (Math.round(n * 100) / 100);
const branch = new URLSearchParams(location.search).get("branch");

// highlight active branch link in the left panel
document.querySelectorAll("aside a").forEach(a => { if (a.dataset.branch === branch) a.classList.add("active"); });

/* ---------- CATALOGUE ---------- */
if ($("books")) {
  const list = branch ? BOOKS.filter(b => b.branch === branch) : BOOKS;
  if (branch) $("catTitle").textContent = branch + " Books";
  $("books").innerHTML = list.map(b => `
   <tr>
    <td><div class="cover" style="background:${b.color}">${b.title}</div></td>
    <td class="left"><strong>Book:</strong> ${b.title}<br><strong>Author:</strong> ${b.author}<br><strong>Publisher:</strong> ${b.pub}</td>
    <td>${money(b.price)}</td>
    <td><button type="button" onclick="addToCart(${b.id})">Add to Cart</button></td>
   </tr>`).join("") || `<tr><td colspan="4">No books found.</td></tr>`;
}
function addToCart(id) {
  const c = getCart(); c[id] = (c[id] || 0) + 1; saveCart(c);
  const b = BOOKS.find(x => x.id === id);
  $("added").textContent = `"${b.title}" added to cart (quantity ${c[id]}). `;
  const a = document.createElement("a"); a.href = "cart.html"; a.textContent = "View cart";
  $("added").appendChild(a);
}

/* ---------- CART ---------- */
if ($("cartBox")) {
  function renderCart() {
    const c = getCart(), ids = Object.keys(c);
    if (!ids.length) { $("cartBox").innerHTML = `<p>Your cart is empty. <a href="catalogue.html">Browse the catalogue</a> to add books.</p>`; return; }
    let total = 0;
    const rows = ids.map(id => {
      const b = BOOKS.find(x => x.id == id), amt = b.price * c[id]; total += amt;
      return `<tr><td>${b.title}</td><td>${money(b.price)}</td>
        <td class="qty"><button onclick="changeQty(${id},-1)">−</button> ${c[id]} <button onclick="changeQty(${id},1)">+</button></td>
        <td>${money(amt)}</td></tr>`;
    }).join("");
    $("cartBox").innerHTML = `<table><thead><tr><th>Book name</th><th>Price</th><th>Quantity</th><th>Amount</th></tr></thead>
      <tbody>${rows}<tr class="total"><th colspan="3">Total amount</th><th>${money(total)}</th></tr></tbody></table>`;
  }
  window.changeQty = (id, d) => { const c = getCart(); c[id] += d; if (c[id] <= 0) delete c[id]; saveCart(c); renderCart(); };
  $("clear").onclick = () => { saveCart({}); renderCart(); };
  renderCart();
}

/* ---------- shared form helpers ---------- */
function showErrors(errors) {
  const m = $("msg");
  m.style.display = errors.length ? "block" : "none";
  m.innerHTML = "<ul>" + errors.map(e => `<li>${e}</li>`).join("") + "</ul>";
  return errors.length === 0;
}
const getUsers = () => JSON.parse(localStorage.getItem("users") || "[]");

/* ---------- REGISTRATION (JS validation) ---------- */
if ($("regForm")) {
  $("day").innerHTML = '<option value="">Day</option>' + Array.from({length:31}, (_, i) => `<option>${i+1}</option>`).join("");
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  $("month").innerHTML = '<option value="">Month</option>' + months.map((m, i) => `<option value="${i+1}">${m}</option>`).join("");
  $("year").innerHTML = '<option value="">Year</option>' + Array.from({length:41}, (_, i) => `<option>${2010-i}</option>`).join("");

  $("regForm").addEventListener("submit", e => {
    e.preventDefault();
    const name = $("name").value.trim(), pw = $("password").value, email = $("email").value.trim(), phone = $("phone").value.trim();
    const errors = [];
    if (!/^[A-Za-z ]+$/.test(name)) errors.push("Name must contain alphabets only.");
    else if (name.length < 6) errors.push("Name must be at least 6 characters long.");
    if (pw.length < 6) errors.push("Password must be at least 6 characters long.");
    if (!/^[A-Za-z0-9._-]+@[A-Za-z0-9-]+(\.[A-Za-z]{2,})+$/.test(email)) errors.push("Enter a valid e-mail in the form name@domain.com.");
    if (!/^\d{10}$/.test(phone)) errors.push("Phone number must contain exactly 10 digits.");
    if (!document.querySelector('input[name="sex"]:checked')) errors.push("Select your sex.");
    if (!$("day").value || !$("month").value || !$("year").value) errors.push("Select your complete date of birth.");
    if (!document.querySelector('input[name="lang"]:checked')) errors.push("Select at least one language.");
    if (!$("address").value.trim()) errors.push("Enter your address.");
    if (!showErrors(errors)) return;
    const users = getUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) return showErrors(["This e-mail is already registered. Please log in."]);
    users.push({name, password: pw, email});
    localStorage.setItem("users", JSON.stringify(users));
    alert("Registration successful! You can now log in.");
    location.href = "login.html";
  });
}

/* ---------- LOGIN ---------- */
if ($("loginForm")) {
  $("loginForm").addEventListener("submit", e => {
    e.preventDefault();
    const u = $("user").value.trim(), p = $("pass").value, errors = [];
    if (!u) errors.push("Enter your user name.");
    if (!p) errors.push("Enter your password.");
    if (!showErrors(errors)) return;
    const found = getUsers().find(x => (x.name === u || x.email.toLowerCase() === u.toLowerCase()) && x.password === p);
    if (!found) return showErrors(["User name or password is incorrect, or you have not registered yet."]);
    alert("Welcome, " + found.name + "!");
    location.href = "index.html";
  });
}
