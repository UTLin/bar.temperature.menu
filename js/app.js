
document.addEventListener("DOMContentLoaded", function () {
    console.log("DOMContentLoaded");

    // 等待 2.5 秒後隱藏 Loading 畫面，顯示主要內容
    setTimeout(() => {
        document.getElementById("loading-screen").style.display = "none";
        let mainContent = document.getElementById("main-content");
        mainContent.style.opacity = "1";
        mainContent.style.filter = "blur(0px)"; // 移除模糊
    }, 2500); // 2.5 秒後執行

    const menuList = document.getElementById("menu-list");
    const searchBar = document.getElementById("search-bar");
    let weeklyTags = [];
    // 建立 Set 來記錄實際出現過的 weekly tag
    const foundWeeklyTags = new Set();

    // toggle sidebar
    const orderSidebar = document.getElementById("order-sidebar");
    document.getElementById("toggle-order").addEventListener("click", () => {
        orderSidebar.classList.toggle("open");
    });

    // ===== 本周水果標籤動畫 =====
    const fruitEmojis = ["🍍", "🍓", "🍉", "🍇", "🍊", "🥭"];
    let emojiIndex = 0;

    // 輪播動畫函數
    function updateWeeklyDesc() {
        const descIconDiv = document.getElementById("weekly-desc-icon");
        const emoji = fruitEmojis[emojiIndex % fruitEmojis.length];
        descIconDiv.style.opacity = 0;
        setTimeout(() => {
            descIconDiv.textContent = `${emoji}`;
            descIconDiv.style.opacity = 1;
        }, 200);
        emojiIndex++;
    }
    // ===== 本周水果標籤 + 動畫 =====

    // 讀取 weekly_tags，獲取本周水果標籤 (來源有json或Google Sheets，目前使用Google)
    // fetch("weekly_tags.json")
    const WEEKLY_TAGS_API = "https://script.google.com/macros/s/AKfycbyI7YXhjuYqHyifQXggKwb-PrqC7sr98mhm8q9glyNjyBhrzY1JjV5Vw8yq1gcHe21e_g/exec";
    fetch(WEEKLY_TAGS_API)
        .then(response => response.json())
        .then(weeklyData => {
            weeklyTags = weeklyData.tags || [];
            console.log("本周水果標籤:", weeklyTags);

            // 顯示本周水果標籤描述
            const descDiv = document.getElementById("weekly-desc");
            if (descDiv && weeklyTags.length > 0) {
                descDiv.textContent = `本周水果：${weeklyTags.join("、")}`;
                updateWeeklyDesc();
                setInterval(updateWeeklyDesc, 5000);
            }

            // 讀取 `data.json`，獲取調酒資訊
            return fetch("data.json");
        })
        .then(response => response.json())
        .then(images => {
            images.forEach(item => {
                // 確保 category 是陣列
                let categories = Array.isArray(item.category) ? item.category : [];

                // 如果符合 weeklyTags，則添加 "本周水果" 標籤
                if (categories.some(tag => weeklyTags.includes(tag)) &&
                    categories.includes("signature") &&
                    !categories.includes("shot")) {
                    categories.push("weekly");

                    // 紀錄有被用到的 tag
                    categories.forEach(tag => {
                        if (weeklyTags.includes(tag)) {
                            foundWeeklyTags.add(tag);
                        }
                    });
                }

                // 將類別轉為字串格式
                const categoryString = categories.join(",");

                // 建立調酒卡片
                const imgElement = document.createElement("div");
                imgElement.classList.add("col-5", "col-md-5", "col-lg-3", "col-xl-3", "col-xxl-2", "my-3", "menu-item");
                imgElement.setAttribute("data-category", categoryString);
                imgElement.setAttribute("data-name", item.name.toLowerCase());

                let categoryText = categories.join(", ");

                imgElement.innerHTML = `
                    <img loading="lazy" src="${item.thumbnail}" data-fullsize="${item.file}" class="thumbnail" alt="${item.name}">
                    <h4>${item.name}</h4>
                    <p><b>Category:</b> ${categoryText}</p>
                    <p>${item.description}</p>
                    <button class="btn btn-sm btn-primary add-to-order" data-name="${item.name}">點這杯</button>
                `;

                menuList.appendChild(imgElement);
            });

            // 點擊縮圖時載入高解析度圖片
            document.querySelectorAll(".thumbnail").forEach(img => {
                img.addEventListener("click", function () {
                    document.getElementById("lightbox-img").src = this.dataset.fullsize;
                    document.getElementById("lightbox").style.display = "block";
                });
            });

            // 關閉 Lightbox
            document.querySelector(".close").addEventListener("click", function () {
                document.getElementById("lightbox").style.display = "none";
            });
            // 點擊 lightbox 背景區域也可以關閉
            document.getElementById("lightbox").addEventListener("click", function (e) {
                // 確保點的是背景而不是圖片本身
                if (e.target.id === "lightbox") {
                    this.style.display = "none";
                }
            });

            // 篩選功能（支援多標籤）
            document.querySelectorAll(".menu-category").forEach(button => {
                button.addEventListener("click", function () {
                    searchBar.value = ""; // ✅ 清除搜尋欄內容
                    let selectedCategory = this.dataset.category.toLowerCase();
                    filterMenu(selectedCategory);
                });
            });

            // ✅ 預設篩選「本周水果」
            filterMenu("weekly");

            // 檢查沒出現的 weekly tags
            const missingTags = weeklyTags.filter(tag => !foundWeeklyTags.has(tag));

            // 加入預設卡片
            missingTags.forEach(tag => {
                const placeholder = document.createElement("div");
                placeholder.classList.add("col-5", "col-md-5", "col-lg-3", "col-xl-3", "col-xxl-2", "my-3", "menu-item");
                placeholder.setAttribute("data-category", "weekly");
                placeholder.setAttribute("data-name", tag.toLowerCase());

                placeholder.innerHTML = `
                    <img loading="lazy" src="img/default-drink.jpg" class="thumbnail" alt="No drink found">
                    <h4>${tag}</h4>
                    <p>製作者還沒喝到，所以沒圖😝</p>
                    <button class="btn btn-sm btn-primary add-to-order" data-name="${tag}">點這杯</button>
                `;

                menuList.appendChild(placeholder);
            });

            renderAccountSelector();
            renderOrderList();
        })
        .catch(error => console.error("⚠️ 無法載入資料", error));

    // **篩選功能（支援多標籤）**
    function filterMenu(selectedCategory) {
        console.log("🔍 目前篩選類別:", selectedCategory);
        document.querySelectorAll(".menu-item").forEach(item => {
            let categories = item.getAttribute("data-category").toLowerCase().split(",");
            if (selectedCategory === "all" || categories.includes(selectedCategory.toLowerCase())) {
                item.style.display = "block";
            } else {
                item.style.display = "none";
            }
        });
    }

    // search-bar 搜尋邏輯
    searchBar.addEventListener("input", function () {
        const keyword = this.value.trim().toLowerCase();

        document.querySelectorAll(".menu-item").forEach(item => {
            const name = item.getAttribute("data-name") || "";
            const category = item.getAttribute("data-category") || "";
            const searchableText = `${name} ${category}`.toLowerCase();

            if (searchableText.includes(keyword)) {
                item.style.display = "block";
            } else {
                item.style.display = "none";
            }
        });
    });

    // 儲存點酒紀錄到 localStorage
    let currentAccount = "自己";
    // 初始化帳戶資料
    const book = JSON.parse(localStorage.getItem("drinkOrderBook") || "{}");
    if (Object.keys(book).length === 0) {
        book[currentAccount] = {};
        localStorage.setItem("drinkOrderBook", JSON.stringify(book));
    }
    function saveOrderBook(book) {
        localStorage.setItem("drinkOrderBook", JSON.stringify(book));
    }

    // 取得紀錄
    function loadOrderBook() {
        return JSON.parse(localStorage.getItem("drinkOrderBook") || "{}");
    }

    // 顯示帳號
    function renderAccountSelector() {
        const book = loadOrderBook();
        const selector = document.getElementById("account-selector");
        selector.innerHTML = "";

        Object.keys(book).forEach(account => {
            const option = document.createElement("option");
            option.value = account;
            option.textContent = account;
            if (account === currentAccount) option.selected = true;
            selector.appendChild(option);
        });
    }

    // 顯示紀錄
    function renderOrderList() {
        const book = loadOrderBook();
        const orders = book[currentAccount] || {};
        const orderList = document.getElementById("order-list");
        orderList.innerHTML = "";

        Object.entries(orders).forEach(([name, count]) => {
            const item = document.createElement("div");
            item.classList.add("d-flex", "justify-content-between", "align-items-center", "my-1");
            item.innerHTML = `
            <span>${name} x ${count}</span>
            <button class="btn btn-sm btn-danger delete-item" data-name="${name}">刪除</button>
        `;
            orderList.appendChild(item);
        });
    }

    // 加入點酒
    let pendingDrinkName = null;
    document.addEventListener("click", function (e) {
        if (e.target.classList.contains("add-to-order")) {
            // 點酒按鈕觸發 modal
            pendingDrinkName = e.target.dataset.name;
            document.getElementById("confirmText").textContent = `你確定要點這杯「${pendingDrinkName}」嗎？`;
            document.getElementById("confirmQty").value = "1";
            new bootstrap.Modal(document.getElementById("confirmModal")).show();
        }

        // 單項刪除
        if (e.target.classList.contains("delete-item")) {
            const name = e.target.dataset.name;
            if (!confirm(`確定要從「${currentAccount}」的紀錄中移除「${name}」嗎？`)) return;
            const book = loadOrderBook();
            if (book[currentAccount] && book[currentAccount][name] !== undefined) {
                delete book[currentAccount][name];
                saveOrderBook(book);
                renderOrderList();
            }
        }

        // 清空
        if (e.target.id === "clear-orders") {
            if (!confirm(`確定要清除「${currentAccount}」的點酒紀錄嗎？`)) return;
            const book = loadOrderBook();
            book[currentAccount] = {}; // 🔄 清空目前帳戶紀錄
            saveOrderBook(book);
            renderOrderList();
        }

        // modal 增加數量
        if (e.target.id === "qty-increase") {
            const qtyInput = document.getElementById("confirmQty");
            let val = parseInt(qtyInput.value) || 1;
            if (val < 20) qtyInput.value = val + 1;
        }

        // modal 減少數量
        if (e.target.id === "qty-decrease") {
            const qtyInput = document.getElementById("confirmQty");
            let val = parseInt(qtyInput.value) || 1;
            if (val > 1) qtyInput.value = val - 1;
        }

        // modal 確認後新增點酒資料
        if (e.target.id === "confirmAdd" && pendingDrinkName) {
            // const qty = parseInt(document.getElementById("confirmQty").value, 10);
            // const orders = loadOrder();
            // orders[pendingDrinkName] = (orders[pendingDrinkName] || 0) + qty;
            // saveOrder(orders);
            // renderOrderList();
            const qty = parseInt(document.getElementById("confirmQty").value, 10);
            const book = loadOrderBook();
            if (!book[currentAccount]) book[currentAccount] = {};
            book[currentAccount][pendingDrinkName] = (book[currentAccount][pendingDrinkName] || 0) + qty;
            saveOrderBook(book);
            renderOrderList();

            pendingDrinkName = null;
            bootstrap.Modal.getInstance(document.getElementById("confirmModal")).hide();
        }


        if (e.target.id === "add-account") {
            const name = prompt("請輸入新帳戶名稱");
            if (!name) return;
            const book = loadOrderBook();
            if (!book[name]) {
                book[name] = {};
                saveOrderBook(book);
                currentAccount = name;
                renderAccountSelector();
                renderOrderList();
            }
        }

        if (e.target.id === "delete-account") {
            if (!confirm(`確定要刪除帳戶「${currentAccount}」嗎？資料將永久移除。`)) return;
            const book = loadOrderBook();
            delete book[currentAccount];
            const remaining = Object.keys(book);
            currentAccount = remaining[0] || "自己";
            if (!book[currentAccount]) book[currentAccount] = {};
            saveOrderBook(book);
            renderAccountSelector();
            renderOrderList();
        }
    });

    document.getElementById("account-selector").addEventListener("change", (e) => {
        currentAccount = e.target.value;
        renderOrderList();
    });
});
