
document.addEventListener("DOMContentLoaded", function () {
    const menuList = document.getElementById("menu-list");
    const searchBar = document.getElementById("search-bar");

    // 調酒分類按鈕
    document.querySelectorAll(".menu-category").forEach(button => {
        button.addEventListener("click", function () {
            const category = this.getAttribute("data-category");
            document.querySelectorAll(".menu-item").forEach(item => {
                if (category === "all" || item.getAttribute("data-category") === category) {
                    item.style.display = "block";
                } else {
                    item.style.display = "none";
                }
            });
        });
    });

    // 設定搜尋功能
    searchBar.addEventListener("input", function () {
        const keyword = searchBar.value.toLowerCase();
        document.querySelectorAll(".menu-item").forEach(item => {
            const name = item.getAttribute("data-name").toLowerCase();
            if (name.includes(keyword)) {
                item.style.display = "block";
            } else {
                item.style.display = "none";
            }
        });
    });

    // 讀取 `img/` 目錄中的圖片（需後端支援，如 PHP 或 Node.js）
    fetch("img/")
        .then(response => response.text())
        .then(text => {
            // 解析 HTML 目錄列表（如果是 Apache/Nginx 可直接回傳目錄內容）
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, "text/html");
            const images = [...doc.querySelectorAll("a[href$='.jpg']")].map(a => a.getAttribute("href"));

            images.forEach(imgPath => {
                const fileName = imgPath.split("/").pop().replace(".jpg", "");
                const parts = fileName.split("-");
                if (parts.length < 3) return; // 確保檔名格式正確

                const category = parts[1]; // 取得分類
                const name = parts.slice(2).join(" "); // 取得名稱（排除日期）

                const imgElement = document.createElement("div");
                imgElement.classList.add("col-md-6", "col-lg-4", "my-3", "menu-item");
                imgElement.setAttribute("data-category", category);
                imgElement.setAttribute("data-name", name);

                imgElement.innerHTML = `
                    <img src="img/${fileName}.jpg" alt="${name}">
                    <h4>${name}</h4>
                    <p class="description">載入中...</p>
                `;

                menuList.appendChild(imgElement);

                // 讀取圖片的 EXIF 註解
                const img = imgElement.querySelector("img");
                img.onload = function () {
                    EXIF.getData(img, function () {
                        const description = EXIF.getTag(this, "ImageDescription") || "無註解";
                        imgElement.querySelector(".description").textContent = description;
                    });
                };
            });
        })
        .catch(error => console.error("無法載入圖片目錄", error));
});
