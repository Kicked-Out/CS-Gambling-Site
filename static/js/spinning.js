document.addEventListener("DOMContentLoaded", async function () {
    // ----------------------- Налаштування -----------------------
    const spinButton = document.getElementById("spin-button");
    // Зверніть увагу: тепер ми працюємо з кожним барабаном окремо, тому не використовуємо глобальний skinsContainer.
    const skinWidth = 155; // ширина одного скіна (150px + 5px gap)
    const visibleSkinsCount = 8; // кількість скінів, що видно одночасно
    const totalSkins = 72; // загальна кількість елементів у масиві
    const winningIndex = 67; // позиція виграшного скіну у масиві
    const desiredVisibleIndex = 2;  // позиція, де має зупинитись виграшний скін

    let isSpinning = false;
    let casePrice = parseFloat(spinButton.getAttribute('data-price'));
    let userBalance = parseFloat("{{ user_profile.wallet_balance }}");
    const isAuthenticated = spinButton.getAttribute('data-authenticated') === "True";

    // Отримуємо всі скіни, що вже присутні в DOM (їх використовуємо для генерації початкової інформації)
    let allSkins = Array.from(document.querySelectorAll(".slot-skin")).map(skin => ({
      name: skin.getAttribute("data-name"),
      odds: parseFloat(skin.getAttribute("data-odds")),
      image_url: skin.querySelector("img").getAttribute("src")
    }));

    function getUSerBalance() {
      fetch('/accounts/get_balance/')
        .then(response => response.json())
        .then(data => {
          userBalance = data.wallet_balance;
          updateButtonState();
        });
    }

    function updateButtonState() {
      if (!isAuthenticated || userBalance < casePrice) {
          spinButton.disabled = true;
          spinButton.classList.add("disabled");
      } else {
          spinButton.disabled = false;
          spinButton.classList.remove("disabled");
      }
    }

    getUSerBalance();

    // ----------------------- Функції для роботи з окремим барабаном -----------------------

    // Функція повертає топ‑5 скінів за найбільшим значенням odds
    function getTopOddsSkins() {
      return [...allSkins].sort((a, b) => b.odds - a.odds).slice(0, 5);
    }

    // Створює DOM-елемент скіна для барабана
    async function createSkinElement(skinData) {
      const skinDiv = document.createElement("div");
      skinDiv.classList.add("slot-skin");
      skinDiv.setAttribute("data-name", skinData.name);
      skinDiv.setAttribute("data-odds", skinData.odds);

      // Припускаємо, що функція getSkinByName визначена глобально і повертає дані про скін
      const skin = await getSkinByName(skinData.name);

      // Відповідність рідкості скіну зображенню (це приклад; налаштуйте за потребою)
      const hexagons = {
        'Consumer': '/static/img/gray.png',
        'Industrial': '/static/img/blue-g.png',
        'Mil': '/static/img/gray.png',
        'Restricted': '/static/img/volet.png',
        'Classified': '/static/img/pink.png',
        'Covert': '/static/img/red.png',
        'Contraband': '/static/img/orange.png',
        'Extraordinary': '/static/img/yellow.png',
      };

      const hexagon = hexagons[skin.rarityName];

      skinDiv.style.borderColor = skin.rarityColor;
      skinDiv.innerHTML = `
        <img src="${skin.image}" alt="${skinData.name}" class="skin-img"/>
        <img src="${hexagon}" alt="${skinData.name}" class="hexagone-img"/>
        <p class="skin-title hidden">${skinData.name}</p>
      `;

      return skinDiv;
    }

    // Генерує нову чергу скінів для барабана.
    // Якщо передані currentVisibleSkins (видимі скіни з попереднього спіну) — використовуємо їх як початок.
    function generateNewQueue(currentVisibleSkins) {
      let newQueue = [];
      if (currentVisibleSkins && currentVisibleSkins.length === visibleSkinsCount) {
        newQueue.push(...currentVisibleSkins);
      } else {
        for (let i = 0; i < visibleSkinsCount; i++) {
          newQueue.push(allSkins[Math.floor(Math.random() * allSkins.length)]);
        }
      }
      for (let i = visibleSkinsCount; i < totalSkins; i++) {
        newQueue.push(allSkins[Math.floor(Math.random() * allSkins.length)]);
      }
      // Примусово вставляємо виграшний скін на позицію winningIndex
      const topOddsSkins = getTopOddsSkins();
      newQueue[winningIndex] = topOddsSkins[Math.floor(Math.random() * topOddsSkins.length)];
      return newQueue;
    }

    // Відображає початкові скіни в контейнері конкретного барабана
    async function displayInitialSkinsForReel(container, queue) {
      container.innerHTML = "";
      for (let i = 0; i < visibleSkinsCount; i++) {
        container.appendChild(await createSkinElement(queue[i]));
      }
    }

    // ----------------------- Анімація для окремого барабана -----------------------

    // Анімація зсуву контейнера (container – це елемент з класом .slot-skins)
    function animateShiftForReel(container, duration) {
      return new Promise(resolve => {
        const startTime = performance.now();
        function step(now) {
          let elapsed = now - startTime;
          let progress = Math.min(elapsed / duration, 1);
          let ease = progress * (2 - progress); // easeOutQuad
          let offset = -skinWidth * ease;
          container.style.transform = `translateX(${offset}px)`;
          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            resolve();
          }
        }
        requestAnimationFrame(step);
      });
    }

    // Функція анімації спіну для конкретного барабана
    async function spinAnimationForReel(container, queue) {
      const totalShiftsNeeded = winningIndex - desiredVisibleIndex;
      const initialDuration = 50;  // швидкий початок
      const finalDuration = 300;   // уповільнення в кінці

      let nextIndex = visibleSkinsCount;

      for (let shift = 0; shift < totalShiftsNeeded; shift++) {
        let duration = initialDuration + (finalDuration - initialDuration) * (shift / (totalShiftsNeeded - 1));
        await animateShiftForReel(container, duration);
        container.firstElementChild.remove();
        container.style.transform = "translateX(0px)";
        if (nextIndex < totalSkins) {
          container.appendChild(await createSkinElement(queue[nextIndex]));
          nextIndex++;
        }
      }
      const visibleSkins = container.querySelectorAll(".slot-skin");
      const winningSkinElement = visibleSkins[desiredVisibleIndex];
      console.log("Виграшний скін для користувача:", winningSkinElement.getAttribute("data-name"));
      winningSkinElement.classList.add("winning");

      const wonSkin = await getSkinByName(winningSkinElement.getAttribute("data-name"));
      await getSkinPrice(wonSkin);

      const case_name = document.getElementById("case_name").textContent;
      wonSkin.case_name = case_name;
      wonSkin.case_price = casePrice;
      await fetch("/accounts/open_case/", {
          method: "POST",
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(wonSkin)
      }).then(res => {
          console.log("Запит завершено! Відповідь:", res);
      });
    }

    // ----------------------- Спін одного барабана -----------------------

    // Функція, що здійснює спін для конкретного барабана (елемент reel – це .slot-wrapper)
    async function spinReel(reel) {
      const container = reel.querySelector(".slot-skins");
      let currentVisibleSkins = [];
      if (container.children.length === visibleSkinsCount) {
        Array.from(container.children).forEach(child => {
          currentVisibleSkins.push({
            name: child.getAttribute("data-name"),
            odds: parseFloat(child.getAttribute("data-odds")),
            image_url: child.querySelector("img").getAttribute("src")
          });
        });
      }
      let queue = generateNewQueue(currentVisibleSkins);
      if (container.children.length !== visibleSkinsCount) {
        await displayInitialSkinsForReel(container, queue);
      }
      await spinAnimationForReel(container, queue);
    }

    // ----------------------- Спін для всіх барабанів -----------------------

    // При натисканні на кнопку спін запускаємо спін для всіх згенерованих барабанів (реєлів)
    async function startSpin() {
      if (userBalance < casePrice) {
        alert('Not enough money');
        return;
      }

      if (isSpinning) return;
      isSpinning = true;

      userBalance -= casePrice;
      updateButtonState();

      // Отримуємо всі барабани (елементи .slot-wrapper у контейнері #reels-container)
      const reels = document.querySelectorAll('#reels-container .slot-wrapper');
      await Promise.all(Array.from(reels).map(reel => spinReel(reel)));

      fetch('/account/update_balance/', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({amount: -casePrice})
      }).then(res => res.json())
        .then(data => {
          userBalance = data.wallet_balance;
          updateButtonState();
        });

      isSpinning = false;
      getUSerBalance();
    }

    // ----------------------- Обробка події -----------------------
    spinButton.addEventListener("click", startSpin);
});
