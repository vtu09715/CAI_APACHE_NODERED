
const API_URL = "http://vudcutu.com:1881/timkiem";

document.addEventListener("DOMContentLoaded", () => {
   
    const form = document.getElementById("searchForm");
    // SỬA: Lấy input theo ID 'madantoc'
    const qInput = document.getElementById("madantoc"); 
    // SỬA: Tên trạng thái
    const statusEl = document.getElementById("status");
    // SỬA: Tên kết quả
    const resultEl = document.getElementById("result"); 
    const clearBtn = document.getElementById("clearBtn");

    // --- Xử lý sự kiện Xóa ---
    clearBtn.addEventListener("click", () => {
        qInput.value = "";
        statusEl.className = "status-clear"; // Thêm class CSS
        statusEl.textContent = "🧹 Đã xóa dữ liệu nhập. Sẵn sàng cho truy vấn mới.";
        resultEl.innerHTML = "";
    });

    // --- Xử lý sự kiện Submit Form ---
    form.addEventListener("submit", async (ev) => {
        ev.preventDefault();
        const q = qInput.value.trim();

        if (!q) {
            statusEl.className = "status-warning"; // Thêm class CSS
            statusEl.textContent = "⚠️ Vui lòng nhập từ khóa.";
            return;
        }

        statusEl.className = "status-info"; // Thêm class CSS
        statusEl.textContent = "⏳ Đang gửi truy vấn tới Node-RED...";
        resultEl.innerHTML = "";

        try {
            const url = new URL(API_URL);
            url.searchParams.set("q", q); // Tham số truy vấn vẫn là 'q'

            const resp = await fetch(url.toString(), {
                method: "GET",
                headers: { Accept: "application/json" },
            });

            if (!resp.ok) {
                // Xử lý lỗi HTTP (404, 500, v.v.)
                throw new Error(`HTTP ${resp.status} - ${resp.statusText || 'Lỗi Server'}`);
            }

            const data = await resp.json();
            
            if (Array.isArray(data) && data.length > 0) {
                statusEl.className = "status-success"; // Thêm class CSS
                statusEl.textContent = `✅ Nhận kết quả thành công. Tìm thấy ${data.length} mục.`;
            } else {
                statusEl.className = "status-error"; // Thêm class CSS
                statusEl.textContent = "❌ Không tìm thấy kết quả phù hợp.";
            }

            renderResult(data, resultEl);

        } catch (err) {
            console.error("Lỗi kết nối API:", err);
            statusEl.className = "status-error"; // Thêm class CSS
            statusEl.textContent = `🚫 Lỗi kết nối hoặc xử lý dữ liệu: ${err.message}`;
            resultEl.innerHTML = `<div class="result-item">Không thể gọi API. Vui lòng kiểm tra console.</div>`;
        }
    });

    qInput.focus();
});

// --- Hàm Hiển thị Kết quả và Xử lý HTML Escape (Giữ nguyên) ---

/**
 * Hiển thị dữ liệu trả về (Mảng hoặc Object) vào container.
 * @param {Array|Object|string} data - Dữ liệu từ API.
 * @param {HTMLElement} container - Element DOM để chèn kết quả vào.
 */
function renderResult(data, container) {
    container.innerHTML = "";
    
    // Hàm tạo HTML cho mỗi mục kết quả
    const makeItem = (title, content) => {
        const el = document.createElement("div");
        el.className = "result-item";
        el.innerHTML = `
            <p><strong>${escapeHtml(title)}</strong></p>
            <pre>${escapeHtml(content)}</pre>
        `;
        return el;
    };

    if (Array.isArray(data)) {
        if (!data.length) {
            container.innerHTML = `<div class="result-item">Không tìm thấy kết quả.</div>`;
            return;
        }
        // Hiển thị từng mục trong mảng
        data.forEach((item, i) =>
            container.appendChild(
                makeItem(`Dân Tộc #${i + 1}`, JSON.stringify(item, null, 2))
            )
        );
    } else if (typeof data === "object" && data !== null) {
        // Hiển thị Object duy nhất
        container.appendChild(makeItem("Dữ liệu Trả Về", JSON.stringify(data, null, 2)));
    } else {
        // Hiển thị các kiểu dữ liệu khác (chuỗi, số, boolean)
        container.appendChild(makeItem("Kết quả Raw", String(data)));
    }
}

/**
 * Đảm bảo chuỗi an toàn khi hiển thị trong HTML.
 * @param {string} str - Chuỗi cần escape.
 */
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}