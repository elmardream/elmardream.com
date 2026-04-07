window.addEventListener('DOMContentLoaded', () => {
    const isHomePage = document.body.classList.contains('home-page');
    const header = document.querySelector('.dynamic-header');
    const menuToggle = document.getElementById('menuToggle');
    const navMobile = document.getElementById('navMobile');
    const START_X_PX = 1560;
    const START_Y_PX = 1310;
    const END_X_PX = 1795;
    const END_Y_PX = 1750;

    let isMenuOpen = false;
    let isHeaderVisible = false;
    let hasAnimatedDistricts = false;
    let lastDistrictId = null;
    let lastSizeId = null;
    let isCityZoneActive = false;
    let isHouseTextSet = false;
    let hasAnimatedSize = false; // Флаг, чтобы анимация не зацикливалась
    let hasAnimatedTime = false;
    let isFinalTextSet = false;

    const logoWrapper = document.querySelector('.logo-animation-wrapper');
    const mainMap = document.getElementById('mainMap');
    const layerCountry = document.getElementById('countryLayer');
    const layerCity = document.getElementById('cityLayer');
    const infoWindow = document.getElementById('districtInfo');
    const districtNameEl = document.getElementById('districtName');
    const districtDescEl = document.getElementById('districtDesc');
    const districtsGroup = document.getElementById('d');
    const mapLetters = document.getElementById('Letters');
    const exploreText = document.getElementById('explore-text');
    const sizeText = document.getElementById('size-text');
    const sizeGroup = document.getElementById('sizeGroup');
    const districtsData = {

        "d1": { title: "ЦЕНТР", desc: "Историческое ядро города, административные здания, торговые центры,\nстадионы и парки.\n\n240 лифтов доступны\nдля размещения рекламы.\n\nМинимальный\nсрок размещения -\n2 недели."},
        "d2": { title: "МЕЛЬНИКОВ ЛУГ", desc: "Живописный\nжилой массив рядом\nс озерами и зонами отдыха.\n\n185 лифтов доступны\nдля размещения рекламы.\n\nМинимальный\nсрок размещения -\n2 недели." },
        "d3": { title: "ВОЛОТОВА", desc: "Развивающийся район\nс современной застройкой\nи новыми школами.\n\n285 лифтов доступны\nдля размещения рекламы.\n\nМинимальный\nсрок размещения -\n2 недели." },
        "d4": { title: "СЕЛЬМАШ 2", desc: "Промышленно-жилой сектор с развитой инфраструктурой.\n\n205 лифтов доступны\nдля размещения рекламы.\n\nМинимальный\nсрок размещения -\n2 недели." },
        "d5": { title: "СЕЛЬМАШ 1", desc: "Сердце машиностроения, рабочие кварталы,\nстадион, парки.\n\n215 лифтов доступны\nдля размещения рекламы.\n\nМинимальный\nсрок размещения -\n2 недели." },
        "d6": { title: "ЗАПАДНЫЙ", desc: "Крупный спальный район\nс торговыми центрами\nи рынками.\n\n80 лифтов доступны\nдля размещения рекламы.\n\nМинимальный\nсрок размещения -\n2 недели." },
        "d7": { title: "СОВЕТСКИЙ 2", desc: "Университетский городок\nи жилые молодежные кварталы.\n\n240 лифтов доступны\nдля размещения рекламы.\n\nМинимальный\nсрок размещения -\n2 недели." },
        "d8": { title: "СОВЕТСКИЙ 1", desc: "Новый микрорайон,\nтихие зеленые улицы\nи уютные жилые кварталы.\n\n240 лифтов доступны\nдля размещения рекламы.\n\nМинимальный\nсрок размещения -\n2 недели." },
        "d9": { title: "НОВОБЕЛИЦА", desc: "Заречная часть города,\nокруженная лесами,\nс новостройками\nи особой атмосферой.\n\n215 лифтов доступны\nдля размещения рекламы.\n\nМинимальный\nсрок размещения -\n2 недели." }
    };

    const sizedata = {
        "s1": { title: "А3", desc: "Вертикальная ориентация.\n\nРазмер макета\n408 х 285 мм.\n\nСтоимость размещения\n8р. 14к.\n\nСкидка 5-20%\nв зависимости от объема." },
        "s2": { title: "А4", desc: "Горизонтальная ориентация.\n\nРазмер макета\n285 х 200 мм.\n\nСтоимость размещения\n4р. 97к.\n\nСкидка 5-20%\nв зависимости от объема." },
        "s3": { title: "А5", desc: "Вертикальная ориентация.\n\nРазмер макета\n140 х 200 мм.\n\nСтоимость размещения\n3р. 4к.\n\nСкидка 5-20%\nв зависимости от объема." },
        "s4": { title: "А6", desc: "Горизонтальная ориентация.\n\nРазмер макета\n140 х 98 мм.\n\nСтоимость размещения\n1р. 79к.\n\nСкидка 5-20%\nв зависимости от объема." }
    };

    function closeMobileMenu() {
        if (!isMenuOpen) return;
        isMenuOpen = false;
        menuToggle.classList.remove('active');
        navMobile.classList.remove('is-open');
        setTimeout(() => { if (!isMenuOpen) navMobile.style.display = 'none'; }, 500);
    }

    if (menuToggle && navMobile) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!isMenuOpen) {
                isMenuOpen = true;
                menuToggle.classList.add('active');
                navMobile.style.display = 'flex';
                setTimeout(() => { navMobile.classList.add('is-open'); }, 50);
            } 
            else { closeMobileMenu(); }
        });
        window.addEventListener('click', (e) => {
            if (isMenuOpen && !navMobile.contains(e.target) && !menuToggle.contains(e.target)) closeMobileMenu();
        });
    }

    function getMapScale() {
        if (!mainMap) return 0.3;
        const w = window.innerWidth;
        const h = window.innerHeight;
        // считаем масштаб чтобы артборд 3000х3000 вписывался целиком
        const baseScale = Math.min(w / 3000, h / 3000);
        // коэффициент увеличения (2.5) для маленькой страны в центре большого артборда.
        let targetScale = baseScale * 2.5;
        // поправка для узких экранов
        if (w < h) {
            // если экран вертикальный, ориентируемся на ширину
            targetScale = (w / 3000) * 2.5;
        }
        return targetScale;
    }

    function animateDistrictsParade() {

        if (hasAnimatedDistricts) return;
        hasAnimatedDistricts = true;

        // выключаем мышь чтобы старые слушатели не мешали
        if (districtsGroup) {
            districtsGroup.style.pointerEvents = "none";
        }

        const tl = gsap.timeline();

        for (let i = 1; i <= 9; i++) {

         const d = document.getElementById(`d${i}`);

         if (d) {
            // СБРОС: масштаб 1, поворот 0, позиция 0
            gsap.set(d, { scale: 1, rotation: 0, x: 0, y: 0, clearProps: "transform" });

            const path = document.getElementById(`d${i}`);
            const text = document.getElementById(`t${i}`);

            if (path) {

                // Принудительно вычисляем длину, даже если элемент был скрыт
                const len = path.getTotalLength() || 1000; 

                // Устанавливаем начальное состояние
                gsap.set(path, { 
                    strokeDasharray: len, 
                    strokeDashoffset: len, 
                    strokeOpacity: 1, 
                    fillOpacity: 0, 
                    opacity: 1,
                    stroke: "#eb7b08",
                });

                if (text) gsap.set(text, { opacity: 0 });

                // Сама анимация
                tl.to(path, { 
                    strokeDashoffset: 0, 
                    duration: 0.3, 
                    ease: "power2.inOut" 
                })
                .to(path, { fill: "#eb7b08", fillOpacity: 0.2, duration: 0.18 }, "<")
                .to(text, { opacity: 1, duration: 0.18 }, "<");
            }}
        }

        // Добавляем команду прямо в очередь таймлайна
        tl.add(() => {

            // 1. Включаем только САМИ ПУТИ (точечно)
            for (let i = 1; i <= 9; i++) {

                const d = document.getElementById(`d${i}`);

                if (d) {
                    d.style.pointerEvents = "all";
                    d.style.cursor = "pointer";
                }
            }

            // 2. Запускаем слушатели событий
            enableMapInteractivity();
        });
    }

    function enableMapInteractivity() {
        // Проверяем, не висят ли уже слушатели (чтобы не дублировать)
        if (!districtsGroup) return;
        
        districtsGroup.removeEventListener('mouseover', handleDistrictOver);
        districtsGroup.removeEventListener('mouseout', handleDistrictOut);
        districtsGroup.addEventListener('mouseover', handleDistrictOver);
        districtsGroup.addEventListener('mouseout', handleDistrictOut);
    }

    function handleDistrictOver(e) {

        const path = e.target.closest('path');

        if (!path) return;

        const id = path.id;
        const textElement = document.getElementById(id.replace('d', 't'));
        const data = districtsData[id];

        // Включаем "ручку"
        path.style.cursor = 'pointer'; 

        gsap.to(path, { 
            fill: "#eb7b08", 
            stroke: "#eb7b08", 
            fillOpacity: 0.5, 
            scale: 1.05, 
            transformOrigin: "center center", 
            duration: 0.3, 
            overwrite: "power1.out" 
        });

        if (textElement) 
            gsap.to(textElement, { 
                scale: 1.08, 
                transformOrigin: "left center", 
                duration: 0.3, 
                overwrite: "power1.out" 
            });

        // запоминает что район уже просмотрен 
        // (так же в самом начале добавлена let lastDistrictId = null;)
        if (id === lastDistrictId) return; 
        // Запоминаем новый район
        lastDistrictId = id; 

        if (data && districtNameEl) {
            districtNameEl.classList.add('fade-out');
            districtDescEl.classList.add('fade-out');
            setTimeout(() => {
                if (districtNameEl) districtNameEl.textContent = data.title;
                if (districtDescEl) districtDescEl.textContent = data.desc;
                districtNameEl.classList.remove('fade-out');
                districtDescEl.classList.remove('fade-out');
            }, 200);
        }
    }

    function handleDistrictOut(e) {
        const path = e.target.closest('path');
        if (!path) return;
        const textElement = document.getElementById(path.id.replace('d', 't'));
        path.style.cursor = 'default';
        gsap.to(path, { 
            fill: "#eb7b08", 
            stroke: "#eb7b08", 
            fillOpacity: 0.2, 
            scale: 1, 
            duration: 0.3, 
            overwrite: "power1.out" 
        });
        if (textElement) 
            gsap.to(textElement, { 
                scale: 1, 
                duration: 0.3, 
                overwrite: "power1.out" 
            });
    }

    function animateSizeParade() {

        if (hasAnimatedSize) return;
        hasAnimatedSize = true;

        if (sizeGroup) {
            sizeGroup.style.pointerEvents = "none";
        }

        const tl = gsap.timeline({
    defaults: { 
        force3D: false}
});

        for (let i = 1; i <= 4; i++) {

            const s = document.getElementById(`s${i}`);

            if (s) {

                // СБРОС: масштаб 1, поворот 0, позиция 0
                gsap.set(s, { scale: 1, rotation: 0, x: 0, y: 0, clearProps: "transform" });

                const path = document.getElementById(`s${i}`);
                const text = document.getElementById(`st${i}`);

                if (path) {

                    const len = path.getTotalLength() || 1000;

                    gsap.set(path, { 
                        strokeDasharray: len, 
                        strokeDashoffset: len, 
                        strokeOpacity: 1, 
                        fillOpacity: 0,
                        opacity: 1, 
                        stroke: "#eb7b08",
                    });

                    if (text) gsap.set(text, { opacity: 0 });

                    // рисуем линии
					tl.to(path, { strokeDashoffset: 0, duration: 0.7, ease: "power3.inOut",
						force3D: false
					})
                    // заливка
					.to(path, { fill: "#eb7b08", fillOpacity: 0.2, duration: 0.2,
						force3D: false
					}, "-=0.2")
                    .to(text, { opacity: 1, duration: 0.18, force3D: false }, "<");
                }}
            }

            // Добавляем команду прямо в очередь таймлайна
            tl.add(() => {

                // 1. Включаем только САМИ ПУТИ 
                for (let i = 1; i <= 4; i++) {

                    const s = document.getElementById(`s${i}`);

                    if (s) {
                        s.style.pointerEvents = "all";
                        s.style.cursor = "pointer";
                    }
                }

                // 2. Запускаем слушатели событий
                enableSizeInteractivity();
            });
        }

        function enableSizeInteractivity() {
            if (!sizeGroup) return;
        // Проверяем, не висят ли уже слушатели (чтобы не дублировать)
            sizeGroup.removeEventListener('mouseover', handleSizeOver);
            sizeGroup.removeEventListener('mouseout', handleSizeOut);
            sizeGroup.addEventListener('mouseover', handleSizeOver);
            sizeGroup.addEventListener('mouseout', handleSizeOut);
        }

        function handleSizeOver(e) {

            const path = e.target.closest('path');

            // оставили защиту от "пустоты"
            if (!path) return; 

            const id = path.id;
            const textElement = document.getElementById(id.replace('s', 'st'));
            const data = sizedata[id]; 

            path.style.cursor = 'pointer';

            // Анимация самого контура 
            gsap.to(path, { 
                fill: "#eb7b08",
                stroke: "#eb7b08",
                fillOpacity: 0.5, 
                scale: 1.05, 
                transformOrigin: "center center", 
                duration: 0.3, 
                overwrite: "power1.out",
    force3D: false 
            });

            if (textElement) 
                gsap.to(textElement, { 
                    scale: 1.1, 
                    transformOrigin: "center", 
                    duration: 0.3, 
                    overwrite: "power1.out",
    force3D: false 
                });

            if (id === lastSizeId) return;
            lastSizeId = id; 

            // Обновление информационного окна
            if (data && districtNameEl) {
                // Используем эффект плавного исчезновения текста
                districtNameEl.classList.add('fade-out');
                districtDescEl.classList.add('fade-out');
                setTimeout(() => {
                    if (districtNameEl) districtNameEl.textContent = data.title;
                    if (districtDescEl) districtDescEl.textContent = data.desc;
                    districtNameEl.classList.remove('fade-out');
                    districtDescEl.classList.remove('fade-out');
                }, 200);
            }
        }

        function handleSizeOut(e) {
            const path = e.target.closest('path');
            if (!path) return; 
            const textElement = document.getElementById(path.id.replace('s', 'st'));
            path.style.cursor = 'default';
        // Возвращаем в исходное состояние
            gsap.to(path, { 
                fill: "#eb7b08", 
                stroke: "#eb7b08", 
                fillOpacity: 0.2, 
                scale: 1, 
                duration: 0.3, 
                overwrite: "power1.out" 
            });
            if (textElement) 
                gsap.to(textElement, { 
                    scale: 1, 
                    duration: 0.3, 
                    overwrite: "power1.out" 
                });
        }

        function updateMapState() {
            const rail = document.querySelector('.zoom-container');
            const house = document.getElementById('houseLayer');
            const labelEl = document.getElementById('infoLabel');

            if (!rail || !layerCountry || !layerCity) return;
            const wW = window.innerWidth;
            const wH = window.innerHeight;
            const scrollPos = window.scrollY;
            const rTop = rail.offsetTop;
            const rHeight = 5000;
        // для расчета прогресса - привязан к пикселям
        // window.scrollY / rHeight даст 1.0 ровно на отметке rHeight пикселей
            const prog = Math.max(0, Math.min(1, window.scrollY / rHeight));
            const baseS = getMapScale();

        // Прогресс Города
        // Цифра 0.07 — это когда Город начинает проявляться (7% скролла)
        // Цифра 33 — это скорость проявления. Чем БОЛЬШЕ число, тем КОРОЧЕ микшер.
            const alphaC = Math.max(0, Math.min(1, (prog - 0.07) * 33));
        // точка входа в лифт
            const houseTrigger = 0.25; 
        // рассчет прогресса для лифта с размерами макетов
            const hProg = Math.max(0, Math.min(1, (prog - houseTrigger) * 10));


            function resetAllStates() {
            // Проверяем, нужно ли вообще что-то сбрасывать, чтобы не дергать GSAP зря
                if (!hasAnimatedDistricts && !hasAnimatedSize && !isCityZoneActive && !isHouseTextSet) return;
                if (districtsGroup) districtsGroup.style.pointerEvents = "none";
                if (sizeGroup) sizeGroup.style.pointerEvents = "none";

                hasAnimatedDistricts = false;
                hasAnimatedSize = false;
                isCityZoneActive = false;
                isHouseTextSet = false;
                lastDistrictId = null;
                lastSizeId = null;

            // 1. ПЛАВНОЕ ГАШЕНИЕ ОКНА И ТЕКСТА
                if (infoWindow) 
                    infoWindow.classList.remove('is-visible');
                const allLabels = [labelEl, districtNameEl, districtDescEl];
                gsap.to(allLabels, { 
                    opacity: 0, 
                    duration: 0.2, 
                    overwrite: true,
                    onComplete: () => {
                        if (labelEl) labelEl.textContent = "";
                        if (districtNameEl) districtNameEl.textContent = "";
                        if (districtDescEl) districtDescEl.innerHTML = "";
                        gsap.set(allLabels, { opacity: 1 });
                    }
                });

                // 2. ПЛАВНОЕ ГАШЕНИЕ ПУТЕЙ
                const finalPaths = [
                    ...(districtsGroup?.querySelectorAll('path') || []),
                    ...(districtsGroup?.querySelectorAll('text') || []), 
                    ...(sizeGroup?.querySelectorAll('path') || []),
                    ...(sizeGroup?.querySelectorAll('text') || [])
                ];
                if (finalPaths.length) {
                    gsap.killTweensOf(finalPaths);
                    gsap.to(finalPaths, { 
                        opacity: 0, 
                        duration: 0.1,
                        overwrite: true,
                        onComplete: () => {
                        // Выключаем мышь для путей, чтобы не мешали
                            finalPaths.forEach(el => {
                                if (el.tagName === 'path') el.style.pointerEvents = "none";
                            });
                        }
                    });
                }  
            }
            // --- 1. страна ---
            const zProg = Math.max(0, Math.min(1, prog / 0.2));
            const cScale = baseS + (zProg * (baseS * 2.5));
            const ePan = gsap.parseEase("power1.out")(zProg);
            const tX = START_X_PX + (ePan * (END_X_PX - START_X_PX));
            const tY = START_Y_PX + (ePan * (END_Y_PX - START_Y_PX));

            gsap.to(layerCountry, {
                x: (wW / 2) - (tX * cScale),
                y: (wH / 2) - (tY * cScale),
                scale: cScale,
                // 0.07 — это когда Страна начинает исчезать (7% скролла)
                // Цифра 35 — это скорость исчезновения. Чем БОЛЬШЕчисло, тем БЫСТРЕЕ исчезнет
                opacity: 1 - Math.max(0, Math.min(1, (prog - 0.07) * 35)),
                duration: 0.1, overwrite: "auto", ease: "none", transformOrigin: "0 0" 
            });

            // --- 2. город ---
            if (alphaC > 0) {
                const cityS = 0.35 + (prog * (baseS * 0.02));
                const cityTX = 4010; 
                const cityTY = 4150;

                // Если мы в зоне дома (hProg > 0), город плавно гаснет.
                // Если мы в зоне страны (скроллим вверх), город гаснет по alphaC.
                let currentCityOpacity = alphaC;

                gsap.to(layerCity, {
                    opacity: currentCityOpacity, 
                    scale: cityS,
                    x: (wW / 2) - (cityTX * cityS),
                    y: (wH / 2) - (cityTY * cityS),
                    pointerEvents: hProg > 0 ? "none" : "all",
                    duration: 0, 
                    overwrite: "auto"
                });
            } else {
                resetAllStates();
                // Если alphaC = 0, город ОБЯЗАН быть невидимым
                gsap.set(layerCity, { opacity: 0, pointerEvents: "none" });
            }


            // --- 3. лифт---
            if (hProg > 0) {

                // 1. прилет
                let currentScale = hProg * (baseS * 0.36);
                let currentOpacity = Math.min(1, hProg * 4);

                // 2. ЭТАП: плавный зум (0.35 -> 0.55)
                if (hProg >= 1 && prog > 0.35) {
                    const zoomFactor = Math.max(0, Math.min(1, (prog - 0.35) * 4)); 
                    currentScale *= (1 + (0.15 * zoomFactor));
                }

                // 3. ЭТАП: резкий улет (после 0.55)
                if (prog >= 0.55) {
                    const warpFactor = Math.max(0, Math.min(1, (prog - 0.55) * 30));

                // В самом начале сбрасываем всё, что было в лифте
                  //   if (warpFactor > 0.1 && hasAnimatedSize) {
                  //     resetAllStates();
                  // }

                    currentScale *= (1 + (0.9 * warpFactor)); 
                    const lateFade = Math.max(0, (warpFactor - 0.7) * 3.33);
                    currentOpacity = 1 - Math.min(1, lateFade);

                    const finalLayer = document.getElementById('finalLayer');

                    if (finalLayer) {
                    // fIn - прилет. fZoom - бесконечный рост до конца 
                        const fIn = Math.max(0, Math.min(1, (prog - 0.55) * 20));
                        const fZoom = Math.max(0, Math.min(1, (prog - 0.55) * 2.8)); 

                    // Масштаб: база 0.44 * прилет * плавный рост на 20%
                        const fScale = (baseS * 0.44) * fIn * (1 + (0.20 * fZoom));
                        const targetX = 1000;
                        const targetY = 1500;

                        gsap.set(finalLayer, {
                            display: (prog > 0.55) ? 'block' : 'none',
                            opacity: 1,
                            scale: fScale,
                            x: (wW / 2) - (targetX * fScale),
                            y: (wH / 2) - (targetY * fScale),
                            transformOrigin: "0 0",
                            zIndex: 50 
                        });
                    }

                } else {

                // Скрываем финальный слой, если мы выше по скроллу
                    gsap.set('#finalLayer', { display: 'none', opacity: 0 });
                }

            // 4. ЕДИНЫЙ ВЫВОД (Один gsap.set на все случаи жизни)
                gsap.set(house, { 
force3D: true, 
willChange: "transform",
                    display: (currentOpacity > 0.01) ? 'block' : 'none',
                    opacity: currentOpacity,
                    scale: currentScale,
                    x: (wW / 2) - (1000 * currentScale), 
                    y: (wH / 2) - (1550 * currentScale),
                    transformOrigin: "0 0",
                    pointerEvents: (currentOpacity < 0.1) ? 'none' : 'all',
                    zIndex: 100
                });

                const f1 = document.getElementById('frame1');
                const f2 = document.getElementById('frame2');
                const f3 = document.getElementById('frame3');

                if (f1 && f2 && f3) {
                    gsap.to(f1, { opacity: (hProg < 0.9) ? 1 : 0, duration: 0.2, overwrite: "auto" });
                    gsap.to(f2, { opacity: (hProg >= 0.6) ? 1 : 0, duration: 0.6, overwrite: "power1.out" });
                    gsap.to(f3, { opacity: (hProg >= 1) ? 1 : 0, duration: 0.6, overwrite: "auto" });
                }

            } else {
                gsap.set(house, { display: 'none', opacity: 0 });
            }

        // --- ПУЛЬТ ОКНА ---
            if (alphaC >= 1 && hProg <= 0.25) {

            // обычный режим - районы видны
                if (infoWindow) infoWindow.classList.add('is-visible');

                if (labelEl && labelEl.textContent !== "АДРЕСНАЯ ПРОГРАММА") 
                    labelEl.textContent = "АДРЕСНАЯ ПРОГРАММА";

                if (!isCityZoneActive) {
                    isCityZoneActive = true;
                    districtNameEl.textContent = "1905 ЛИФТОВ";
                    districtDescEl.textContent = "В 9 районах Гомеля\n1905 лифтовых кабин\nоборудованы конструкциями\nдля размещения\nрекламных материалов.\n\nМинимальный\nсрок размещения -\n2 недели.";

                // Выключаем мышь для всей группы ПЕРЕД началом анимации
                    if (districtsGroup) districtsGroup.style.pointerEvents = "none"; 
                    animateDistrictsParade(); 
                }
            } 

            else if (hProg >= 1 && prog < 0.55) {

            // обычный режим - размеры видны
                if (infoWindow) infoWindow.classList.add('is-visible');

                if (labelEl && labelEl.textContent !== "РАЗМЕРЫ МАКЕТОВ") 
                    labelEl.textContent = "РАЗМЕРЫ МАКЕТОВ";

                if (!isHouseTextSet) {
                    isHouseTextSet = true;
                    districtNameEl.textContent = "А3, А4, А5, А6";
                    districtDescEl.textContent = "Стенд для объявлений\nпредставляет собой\n2 ячейки формата А3.\n\nВо время движения лифта\nрекламное объявление\nневозможно закрыть,\nотключить, смахнуть,\nигнорировать и т.д.\n\nВашу рекламу увидят!";

                    if (sizeGroup) sizeGroup.style.pointerEvents = "none"; 
                    animateSizeParade(); 
                }
            }

            else if (prog >= 0.6 && prog < 0.83) {

                if (!isHouseTextSet) isHouseTextSet = true;

                if (infoWindow) infoWindow.classList.add('is-visible');

        // Задаем текст только один раз, чтобы не дергать движок
                if (labelEl && labelEl.textContent !== "МЫ НАХОДИМСЯ") {
                    labelEl.textContent = "МЫ НАХОДИМСЯ";
                    districtNameEl.textContent = "БЦ Пушкинъ Плаза";
                    districtDescEl.textContent = "Гомель, ул. Пушкина 2,\nлевый цокольный этаж.\n\nВремя работы:\nПонедельник - Пятница\n9:00 - 18:00\n";
                }
            }

            else {
                resetAllStates()
            }
        }


    /* --- 5. ЗАПУСК ПРИ ЗАГРУЗКЕ --- */
        if (isHomePage && mainMap) {
            const initS = getMapScale();
            gsap.set(layerCountry, { 
                x: (window.innerWidth * 0.5) - (START_X_PX * initS), 
                y: (window.innerHeight * 0.5) - (START_Y_PX * initS), 
                scale: initS, opacity: 1 
            });

            gsap.set(mainMap, { opacity: 1 });

            // Входная анимация
            const introTl = gsap.timeline({
    defaults: { force3D: false } 
});
            const mainL = document.getElementById('l');
            if (mainL) {
                const len = mainL.getTotalLength();
                gsap.set(mainL, { strokeDasharray: len, strokeDashoffset: len });
                introTl.to(mainL, { strokeDashoffset: 0, duration: 0.7 });
            }
            for (let i = 1; i <= 6; i++) {
                const l = document.getElementById(`l${i}`), p = document.getElementById(`p${i}`), c = document.getElementById(`c${i}`);
                if (l) introTl.to(l, { fillOpacity: 1, Opacity: 1, duration: 0.3 }, "-=0.2");
                if (p) introTl.fromTo(p, { attr: { r: 0 }, opacity: 0 }, { attr: { r: p.getAttribute('r') || 15 }, opacity: 1, duration: 0.4 }, "<");
                if (c) introTl.to(c, { opacity: 1, duration: 0.3 }, "<");
            }
            if (mapLetters) {
                const letters = mapLetters.querySelectorAll("path, polygon");
                introTl.to(mapLetters, { opacity: 1, duration: 0.1 }, "<");
                introTl.fromTo(letters, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 }, "<0.2");
                if (exploreText) introTl.to(exploreText, { autoAlpha: 1, duration: 0.6 }, "-=0.2");
                introTl.to(letters, { opacity: 0.7, duration: 0.3, stagger: { each: 0.15, repeat: -1, yoyo: true, repeatDelay: 1 } });
            }

            window.addEventListener('scroll', updateMapState, { passive: true });
            window.addEventListener('resize', updateMapState);
            updateMapState();
        }

    // Хедер
        setTimeout(() => { 
            isHeaderVisible = true; 
            gsap.to(header, { top: 20, opacity: 1, duration: 0.8 }); 
        }, 100);

    /* --- 6. ДОПОЛНИТЕЛЬНЫЕ ПРОВЕРКИ ПРИ ИЗМЕНЕНИИ ОКНА --- */
        window.addEventListener('resize', () => { 
            // Если окно стало шире 700px и меню открыто — закрываем его
            if (window.innerWidth > 700 && isMenuOpen) { 
                closeMobileMenu(); 
            } 
        });

    });
