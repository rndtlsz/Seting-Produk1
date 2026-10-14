const STORAGE_KEY = "produk-panel-data-v1";
const starterProducts = [
  {id:1,name:"Tas Selempang Casual",image:"https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=160&h=160&fit=crop",price:125000,stock:24},
  {id:2,name:"Sepatu Sneakers Urban",image:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=160&h=160&fit=crop",price:289000,stock:4},
  {id:3,name:"Jam Tangan Minimalis",image:"https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=160&h=160&fit=crop",price:175000,stock:58}
];
let products = loadProducts();
let toastTimer;

function loadProducts(){
  try { const saved = localStorage.getItem(STORAGE_KEY); return saved ? JSON.parse(saved) : starterProducts; }
  catch { return starterProducts; }
}
function persist(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(products)); }
function rupiah(value){ return new Intl.NumberFormat("id-ID").format(Number(value)||0); }
function escapeHtml(value){ return String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[char])); }
function statusFor(stock){
  if(Number(stock)===0) return {label:"Habis",className:"out-stock"};
  if(Number(stock)<=5) return {label:"Stok menipis",className:"low-stock"};
  return {label:"Tersedia",className:"in-stock"};
}
function render(){
  const query = document.getElementById("searchInput").value.trim().toLowerCase();
  const filtered = products.filter(p=>p.name.toLowerCase().includes(query));
  document.getElementById("productList").innerHTML = filtered.map(p=>{
    const status=statusFor(p.stock);
    const image = p.image || "";
    return `<tr data-id="${p.id}">
      <td><div class="product-cell"><img class="product-image" src="${escapeHtml(image)}" alt="${escapeHtml(p.name)}" onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22%3E%3Crect width=%2260%22 height=%2260%22 rx=%229%22 fill=%22%23f0f1f7%22/%3E%3Ctext x=%2230%22 y=%2236%22 font-size=%2224%22 text-anchor=%22middle%22 fill=%22%23999caf%22%3E%3F%3C/text%3E%3C/svg%3E'"><div><div class="product-name">${escapeHtml(p.name)}</div><div class="product-id">ID Produk #${p.id}</div></div></div></td>
      <td><input class="edit-input price-input" aria-label="Harga ${escapeHtml(p.name)}" type="text" inputmode="numeric" value="${rupiah(p.price)}"></td>
      <td><input class="edit-input stock-input" aria-label="Stok ${escapeHtml(p.name)}" type="number" min="0" step="1" value="${Number(p.stock)||0}"></td>
      <td><span class="status-pill ${status.className}">${status.label}</span></td>
      <td><div class="action-cell"><button class="save-btn" data-action="save">Simpan</button><button class="delete-btn" data-action="delete" aria-label="Hapus ${escapeHtml(p.name)}" title="Hapus produk">×</button></div></td>
    </tr>`;
  }).join("");
  if(!filtered.length) document.getElementById("productList").innerHTML='<tr><td colspan="5" style="padding:28px;text-align:center;color:#999caf">Produk tidak ditemukan.</td></tr>';
  document.getElementById("totalProducts").textContent=products.length;
  document.getElementById("totalStock").textContent=products.reduce((sum,p)=>sum+(Number(p.stock)||0),0).toLocaleString("id-ID");
  document.getElementById("lowStock").textContent=products.filter(p=>Number(p.stock)<=5).length;
  document.getElementById("resultCount").textContent=`Menampilkan ${filtered.length} dari ${products.length} produk`;
}
function showToast(message="Data produk sudah diperbarui."){
  const toast=document.getElementById("toast");
  toast.querySelector("strong").textContent="Berhasil disimpan!";
  toast.querySelector("small").textContent=message;
  toast.classList.add("show"); clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>toast.classList.remove("show"),2800);
}
document.getElementById("productList").addEventListener("click",e=>{
  const button=e.target.closest("button[data-action]"); if(!button)return;
  const row=button.closest("tr"), id=Number(row.dataset.id);
  if(button.dataset.action==="save"){
    const price=row.querySelector(".price-input"), stock=row.querySelector(".stock-input");
    const parsedPrice=Number(String(price.value).replace(/\D/g, ""));
    if(price.value.trim()===""||stock.value===""||!Number.isFinite(parsedPrice)||parsedPrice<0||Number(stock.value)<0){showToast("Harga dan stok harus bernilai 0 atau lebih.");return;}
    products=products.map(p=>p.id===id?{...p,price:Math.floor(parsedPrice),stock:Math.floor(Number(stock.value))}:p);
    persist(); render(); showToast("Harga dan stok berhasil diperbarui.");
  }
  if(button.dataset.action==="delete"){
    if(confirm("Hapus produk ini dari daftar?")){
      products=products.filter(p=>p.id!==id);persist();render();showToast("Produk berhasil dihapus.");
    }
  }
});
document.getElementById("productList").addEventListener("input",e=>{
  if(e.target.classList.contains("price-input")){
    const input=e.target;
    const digits=String(input.value).replace(/\D/g, "");
    input.value=digits ? new Intl.NumberFormat("id-ID").format(Number(digits)) : "";
    input.setSelectionRange(input.value.length,input.value.length);
  }
});
document.getElementById("searchInput").addEventListener("input",render);
const backdrop=document.getElementById("modalBackdrop");
function openModal(){document.getElementById("productForm").reset();backdrop.hidden=false;document.getElementById("newName").focus();}
function closeModal(){backdrop.hidden=true;}
document.getElementById("addProductBtn").addEventListener("click",openModal);
document.getElementById("closeModal").addEventListener("click",closeModal);
document.getElementById("cancelModal").addEventListener("click",closeModal);
backdrop.addEventListener("click",e=>{if(e.target===backdrop)closeModal();});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal();});
document.getElementById("productForm").addEventListener("submit",e=>{
  e.preventDefault();
  const name=document.getElementById("newName").value.trim();
  const image=document.getElementById("newImage").value.trim();
  const price=Number(document.getElementById("newPrice").value);
  const stock=Number(document.getElementById("newStock").value);
  if(!name||price<0||stock<0)return;
  products.push({id:products.reduce((max,p)=>Math.max(max,p.id),0)+1,name,image,price:Math.floor(price),stock:Math.floor(stock)});
  persist();render();closeModal();showToast("Produk baru berhasil ditambahkan.");
});
render();
