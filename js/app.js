
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
                // **確保 category 是陣列**
                let categories = Array.isArray(item.category) ? item.category : [];

                // **如果符合 weeklyTags，則添加 "本周水果" 標籤**
                if (categories.some(tag => weeklyTags.includes(tag))) {
                    categories.push("weekly");
                }

                // **將類別轉為字串格式**
                const categoryString = categories.join(",");

                // **建立調酒卡片**
                const imgElement = document.createElement("div");
                imgElement.classList.add("col-5", "col-md-5", "col-lg-3", "col-xl-3", "col-xxl-2", "my-3", "menu-item");
                imgElement.setAttribute("data-category", categoryString);
                imgElement.setAttribute("data-name", item.name.toLowerCase());

                let categoryText = categories.join(", ");

                imgElement.innerHTML = `
                    <img src="${item.thumbnail}" data-fullsize="${item.file}" class="thumbnail" alt="${item.name}">
                    <h4>${item.name}</h4>
                    <p><b>Category:</b> ${categoryText}</p>
                    <p>${item.description}</p>
                `;

                menuList.appendChild(imgElement);
            });

            // **點擊縮圖時載入高解析度圖片**
            document.querySelectorAll(".thumbnail").forEach(img => {
                img.addEventListener("click", function () {
                    document.getElementById("lightbox-img").src = this.dataset.fullsize;
                    document.getElementById("lightbox").style.display = "block";
                });
            });

            // **關閉 Lightbox**
            document.querySelector(".close").addEventListener("click", function () {
                document.getElementById("lightbox").style.display = "none";
            });

            // **篩選功能（支援多標籤）**
            document.querySelectorAll(".menu-category").forEach(button => {
                button.addEventListener("click", function () {
                    let selectedCategory = this.dataset.category.toLowerCase();
                    filterMenu(selectedCategory);
                });
            });

            // ✅ 預設篩選「本周水果」
            filterMenu("weekly");
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
});
