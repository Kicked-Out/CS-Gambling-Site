document.addEventListener("DOMContentLoaded", async function () {
    // ----------------------- Налаштування -----------------------
    const spinButton = document.getElementById("spin-button");
    const skinsContainer = document.getElementById("slot-skins");
    const skinWidth = 155; // ширина одного скіна (150px + 5px gap)
    const visibleSkinsCount = 8; // кількість скінів, що видно одночасно
    const totalSkins = 72; // загальна кількість елементів у масиві
    const winningIndex = 67; // у цьому індексі масиву буде примусово встановлено виграшний скін
    // Після завершення спіну виграшний скін має опинитися у цьому слоті,
    // і цей же слот буде показаний користувачу як виграшний (третій зліва, індекс 2)
    const desiredVisibleIndex = 3;

    let isSpinning = false;
    let skinsQueue = []; // поточний масив скінів
    let nextIndex = visibleSkinsCount; // індекс наступного елемента для додавання

    let casePrice = parseFloat(spinButton.getAttribute('data-price'));
    let userBalance = parseFloat("{{ user_profile.wallet_balance }}");
    const isAuthenticated = spinButton.getAttribute('data-authenticated') === "True";

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

    // ----------------------- Джерело даних -----------------------
    // Припускаємо, що на сторінці вже є елементи .slot-skin (серверний рендер)
    let allSkins = Array.from(document.querySelectorAll(".slot-skin")).map(skin => ({
      name: skin.getAttribute("data-name"),
      odds: parseFloat(skin.getAttribute("data-odds"))
    }));

    // Функція повертає топ‑5 скінів за найбільшим значенням odds
    function getTopOddsSkins() {
      return [...allSkins].sort((a, b) => b.odds - a.odds).slice(0, 5);
    }
  
    // ----------------------- Створення DOM-елемента скіна -----------------------
    async function createSkinElement(skinData) {
      const skinDiv = document.createElement("div");
      skinDiv.classList.add("slot-skin");
      skinDiv.setAttribute("data-name", skinData.name);
      skinDiv.setAttribute("data-odds", skinData.odds);
      
      const skin = await getSkinByName(skinData.name);

      // Список гексів. Є не всі PNG. ПАНЕ DIZI ЗРОБІТЬ ІЩЕ, АЛЕ ВЖЕ НЕ В .ПЕЕСДЕ, а в .ПЕЕНҐЕ)
      // Немає: pink, orange
      const hexagons = {
        'Consumer': '/static/img/gray.png',
        'Industrial': '/static/img/blue-g.png',
        'Mil': '/static/img/gray.png',
        'Restricted': '/static/img/volet.png',
        'Classified': '/static/img/pink.png',
        'Covert': '/static/img/red.png',
        'Contraband': '/static/img/orange.png',
        'Extraordinary': '/static/img/yellow.png',
      }

      console.log(skin.rarityName);
      // Беремо зображення за ключем
      // Як знав, що треба буде зберігати rarityName))). skin.rarityName, у даному випадку, це ключ. Тобто рідкість.
      const hexagon = hexagons[skin.rarityName];
      
      skinDiv.style.borderColor = skin.rarityColor;
      skinDiv.innerHTML = `
        <img src="${skin.image}" alt="${skinData.name}" class="skin-img"/>
        <img src="${hexagon}" alt="${skinData.name}" class="hexagone-img"/>
        <p class="skin-title hidden">${skinData.name}</p>
      `;

      return skinDiv;
  }


    // ----------------------- Генерація нового масиву скінів -----------------------
    // Якщо передані currentVisibleSkins (8 скіни із попереднього спіну), вони використовуються як перші 8 елементів.
    // Решту позицій (до 72) заповнюємо випадковими скінами,
    // а на позицію winningIndex примусово вставляємо один із топ‑5 скінів.
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
  
    // ----------------------- Відображення початкових скінів -----------------------
    async function displayInitialSkins(queue) {
      skinsContainer.innerHTML = "";
      for (let i = 0; i < visibleSkinsCount; i++) {
        skinsContainer.appendChild(await createSkinElement(queue[i]));
      }
    }
  
    // ----------------------- Анімація одного зсуву -----------------------
    // Функція анімує переміщення контейнера на ширину одного скіна із easing-ефектом (easeOutQuad)
    // Повертає Promise, який резолвиться після завершення анімації.
    function animateShift(duration) {
      return new Promise(resolve => {
        const startTime = performance.now();
        function step(now) {
          let elapsed = now - startTime;
          let progress = Math.min(elapsed / duration, 1);
          let ease = progress * (2 - progress); // easeOutQuad
          let offset = -skinWidth * ease;
          skinsContainer.style.transform = `translateX(${offset}px)`;
          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            resolve();
          }
        }
        requestAnimationFrame(step);
      });
    }
  
    // ----------------------- Анімація спіну -----------------------
    // Виконуємо кілька зсувів, щоб після завершення виграшний скін із масиву (з позиції winningIndex)
    // опинився у видимій частині за індексом desiredVisibleIndex.
    async function spinAnimation() {
      // Кількість зсувів: (winningIndex - desiredVisibleIndex).
      // Наприклад, якщо winningIndex = 67, а desiredVisibleIndex = 2, то буде 65 зсувів.
      const totalShiftsNeeded = winningIndex - desiredVisibleIndex;
      const initialDuration = 50;  // швидкий початок
      const finalDuration = 300;   // уповільнення в кінці
  
      nextIndex = visibleSkinsCount; // скидаємо лічильник наступного елемента
  
      for (let shift = 0; shift < totalShiftsNeeded; shift++) {
        let duration = initialDuration + (finalDuration - initialDuration) * (shift / (totalShiftsNeeded - 1));
        await animateShift(duration);
        // Після завершення анімації – видаляємо перший (лівий) елемент і скидаємо transform
        skinsContainer.firstElementChild.remove();
        skinsContainer.style.transform = "translateX(0px)";
        // Додаємо наступний скін із масиву (якщо він є)
        if (nextIndex < totalSkins) {
          skinsContainer.appendChild(await createSkinElement(skinsQueue[nextIndex]));
          nextIndex++;
        }
      }
      // Після завершення спіну у видимій частині має бути виграшний скін за індексом desiredVisibleIndex.
      const visibleSkins = skinsContainer.querySelectorAll(".slot-skin");
      const winningSkinElement = visibleSkins[desiredVisibleIndex];
      console.log("Виграшний скін для користувача:", winningSkinElement.getAttribute("data-name"));
      // Для візуального ефекту підсвічуємо його (наприклад, додаємо клас .winning)
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
  
    // ----------------------- Обробка натискання на кнопку спіну -----------------------
    async function startSpin() {
      console.log("case opening", casePrice);

      if(userBalance < casePrice) {
        alert('Not enough money');
        isSpinning = false;
        return;
    }

      if (isSpinning) return;
      isSpinning = true;

      userBalance -= casePrice;
      updateButtonState();


      fetch('/accounts/cases_opened/')
      .then(response => response.json())
  
      // Якщо це не перший спін, беремо поточні видимі скіни з контейнера
      // для використання їх як перших 6 елементів нового масиву.
      let currentVisibleSkins = [];
      if (skinsContainer.children.length === visibleSkinsCount) {
        Array.from(skinsContainer.children).forEach(child => {
          currentVisibleSkins.push({
            name: child.getAttribute("data-name"),
            odds: parseFloat(child.getAttribute("data-odds")),
            image_url: child.querySelector("img").getAttribute("src")
          });
        });
      }
  
      // Генеруємо новий масив скінів із гарантованим виграшним скіном (на позиції winningIndex)
      skinsQueue = generateNewQueue(currentVisibleSkins);
  
      // Якщо контейнер містить не 6 елементів, перерендеримо його
      if (skinsContainer.children.length !== visibleSkinsCount) {
        await displayInitialSkins(skinsQueue);
      }
  
      // Запускаємо анімацію спіну
      await initialize();
      await spinAnimation();

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
  
    // ----------------------- Ініціалізація -----------------------
    // При завантаженні сторінки, якщо сервером уже згенеровано перші скіни – використовуємо їх,
    // або генеруємо новий масив і відображаємо перші 6 скінів.
    skinsQueue = generateNewQueue();
    await displayInitialSkins(skinsQueue);
  
    spinButton.addEventListener("click", startSpin);
  });
  