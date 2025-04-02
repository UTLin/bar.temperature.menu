
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

    // 讀取 `weekly_tags.json`，獲取本周水果標籤
    fetch("weekly_tags.json")
        .then(response => response.json())
        .then(weeklyData => {
            weeklyTags = weeklyData.tags || [];
            console.log("本周水果標籤:", weeklyTags);

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
                    <p>圖片還在製作中</p>
                `;

                menuList.appendChild(placeholder);
            });
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


});
