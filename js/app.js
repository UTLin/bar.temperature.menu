
document.addEventListener("DOMContentLoaded", function () {
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

    // 讀取 `img/` 目錄中的圖片
    fetch("data.json")
        .then(response => response.json())
        .then(images => {
            images.forEach(item => {
                const imgElement = document.createElement("div");
                imgElement.classList.add("col-md-5", "col-xl-3", "my-3", "menu-item");
                imgElement.setAttribute("data-category", item.category);
                imgElement.setAttribute("data-name", item.name.toLowerCase());

                imgElement.innerHTML = `
                    <img src="${item.thumbnail}" data-fullsize="${item.file}" class="thumbnail" alt="${item.name}">
                    <h4>${item.name}</h4>
                    <p>${item.description}</p>
                `;

                menuList.appendChild(imgElement);
            });

            document.querySelectorAll(".thumbnail").forEach(img => {
                img.addEventListener("click", function () {
                    let fullsizeImg = this.dataset.fullsize;
                    document.getElementById("lightbox-img").src = fullsizeImg;
                    document.getElementById("lightbox").style.display = "block";
                });
            });

            document.querySelector(".close").addEventListener("click", function () {
                document.getElementById("lightbox").style.display = "none";
            });
        })
        .catch(error => console.error("無法載入圖片資料", error));
});
