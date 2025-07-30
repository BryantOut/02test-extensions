(async function () {
  console.log("🚀 content.js 已注入");

  function waitForSelector(selector, timeout = 8000) {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const timer = setInterval(() => {
        const el = document.querySelector(selector);
        if (el) {
          clearInterval(timer);
          resolve(el);
        } else if (Date.now() - start > timeout) {
          clearInterval(timer);
          reject("⏰ 超时：" + selector);
        }
      }, 300);
    });
  }

  function getCurrentPageNumber() {
    const active = document.querySelector(".el-pagination .number.active");
    return active ? parseInt(active.textContent.trim()) : null;
  }

  try {
    const input = await waitForSelector("input[placeholder='渠道标识']");
    input.value = "123456";
    input.dispatchEvent(new Event("input", { bubbles: true }));

    const queryBtn = Array.from(document.querySelectorAll("button.el-button--primary"))
      .find((btn) => btn.textContent.trim() === "查询");

    if (!queryBtn) {
      alert("❌ 查询按钮未找到");
      return;
    }

    queryBtn.click();
    await waitForSelector("td.order_title-column > div.cell");

    const results = [];

    while (true) {
      await waitForSelector("td.order_title-column > div.cell");

      const cells = document.querySelectorAll("td.order_title-column > div.cell");
      cells.forEach(cell => {
        const name = cell.innerText.trim();
        if (name) results.push(name);
      });

      const nextBtn = document.querySelector(".el-pagination .btn-next");
      if (!nextBtn || nextBtn.classList.contains("is-disabled")) {
        break;
      }

      const currentPage = getCurrentPageNumber();
      nextBtn.click();

      // 等待页码变化或超时
      const pageChanged = await new Promise((resolve) => {
        const start = Date.now();
        const interval = setInterval(() => {
          const newPage = getCurrentPageNumber();
          if (newPage && newPage !== currentPage) {
            clearInterval(interval);
            resolve(true);
          } else if (Date.now() - start > 5000) {
            clearInterval(interval);
            resolve(false); // 页码未变
          }
        }, 300);
      });

      if (!pageChanged) {
        console.warn("⚠️ 页码未变化，可能已到最后一页。");
        break;
      }

      await new Promise(r => setTimeout(r, 500)); // 短暂等待数据加载
    }

    console.log("✅ 抓到的商品：", results);
    alert(`✅ 抓取完成！共抓取 ${results.length} 条商品名称。\n前10条示例：\n${results.slice(0, 10).join("\n")}`);

    chrome.runtime.sendMessage({
      type: "notify",
      title: "抓取完成",
      message: `共抓取 ${results.length} 条商品名称`
    });

  } catch (err) {
    console.error("⚠️ 脚本运行出错:", err);
    alert("脚本错误：" + err);
  }
})();
