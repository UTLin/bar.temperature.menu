
document.addEventListener("DOMContentLoaded", function () {
    console.log("DOMContentLoaded")
    // 等待 2.5 秒後隱藏 Loading 畫面，顯示主要內容
    setTimeout(() => {
        document.getElementById("loading-screen").style.display = "none";
        let mainContent = document.getElementById("main-content");
        mainContent.style.opacity = "1";
        mainContent.style.filter = "blur(0px)"; // 移除模糊
    }, 2500); // 2.5 秒後執行

    const menuList = document.getElementById("menu-list");
    const searchBar = document.getElementById("search-bar");

    // 調酒分類按鈕
    // document.querySelectorAll(".menu-category").forEach(button => {
    //     button.addEventListener("click", function () {
    //         const category = this.getAttribute("data-category");
    //         document.querySelectorAll(".menu-item").forEach(item => {
    //             if (category === "all" || item.getAttribute("data-category") === category) {
    //                 item.style.display = "block";
    //             } else {
    //                 item.style.display = "none";
    //             }
    //         });
    //     });
    // });

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

    // 讀取 `img/` 目錄中的圖片
    fetch("data.json")
        .then(response => response.json())
        .then(images => {
            images.forEach(item => {

                const imgElement = document.createElement("div");
                imgElement.classList.add("col-5", "col-md-5", "col-lg-3", "col-xl-3", "col-xxl-2", "my-3", "menu-item");
                imgElement.setAttribute("data-category", item.category.join(",")); // 🔹 轉為字串
                imgElement.setAttribute("data-name", item.name.toLowerCase());

                // ✅ 轉換 category 陣列為字串，顯示所有標籤
                let categoryText = item.category.join(", ");

                imgElement.innerHTML = `
                    <img src="${item.thumbnail}" data-fullsize="${item.file}" class="thumbnail" alt="${item.name}">
                    <h4>${item.name}</h4>
                    <p><b>Category:</b> ${categoryText}</p>
                    <p><b>Description:</b> ${item.description}</p>
                `;

                menuList.appendChild(imgElement);
            });

            // ✅ 點擊縮圖時載入高解析度圖片
            document.querySelectorAll(".thumbnail").forEach(img => {
                img.addEventListener("click", function () {
                    document.getElementById("lightbox-img").src = this.dataset.fullsize;
                    document.getElementById("lightbox").style.display = "block";
                });
            });

            // ✅ 關閉 Lightbox
            document.querySelector(".close").addEventListener("click", function () {
                document.getElementById("lightbox").style.display = "none";
            });

            // ✅ 篩選功能（支援多個標籤）
            document.querySelectorAll(".menu-category").forEach(button => {
                button.addEventListener("click", function () {
                    let selectedCategory = this.dataset.category.toLowerCase();
                    document.querySelectorAll(".menu-item").forEach(item => {
                        let categories = item.getAttribute("data-category").toLowerCase().split(",");
                        if (selectedCategory === "all" || categories.includes(selectedCategory)) {
                            item.style.display = "block";
                        } else {
                            item.style.display = "none";
                        }
                    });
                });
            });
        })
        .catch(error => console.error("無法載入圖片資料", error));
});
