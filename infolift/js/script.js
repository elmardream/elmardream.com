window.addEventListener('DOMContentLoaded', () => {
    const isHomePage = document.body.classList.contains('home-page');
    const header = document.querySelector('.dynamic-header');
    const menuToggle = document.getElementById('menuToggle');
    const navMobile = document.getElementById('navMobile');
    const START_X_PX = 1560;
    const START_Y_PX = 1310;
    const END_X_PX = 1795;
    const END_Y_PX = 1750;
	const rail = document.querySelector('.zoom-container');
	const house = document.getElementById('houseLayer');
	const labelEl = document.getElementById('infoLabel');
	const finalLayer = document.getElementById('finalLayer');
	
	// Коллекция для Города
	const districtPaths = Array.from({length: 9}, (_, i) => document.getElementById(`d${i+1}`));
	const districtTexts = Array.from({length: 9}, (_, i) => document.getElementById(`t${i+1}`));
	
	// Коллекция для Лифта
	const sizePaths = Array.from({length: 4}, (_, i) => document.getElementById(`s${i+1}`));
	const sizeTexts = Array.from({length: 4}, (_, i) => document.getElementById(`st${i+1}`));

	
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
	// Используем переменную-флаг, чтобы знать, что всё уже чисто
	let isCurrentlyReset = false;
	let districtsTL, sizeTL;


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

        "d1": { title: "ЦЕНТР", desc: "Исторический центр, административные\nи торговые центры,\nстадионы и парки.\n\n240 лифтов доступны\nдля размещения рекламы."},
        "d2": { title: "МЕЛЬНИКОВ ЛУГ", desc: "Живописный\nжилой массив\nрядом с озерами\nи зонами отдыха.\n\n185 лифтов доступны\nдля размещения рекламы." },
        "d3": { title: "ВОЛОТОВА", desc: "Развивающийся\nгустонаселенный район\nс новостройками\nи школами.\n\n285 лифтов доступны\nдля размещения рекламы." },
        "d4": { title: "СЕЛЬМАШ 2", desc: "Промышленно-жилой сектор с развитой инфраструктурой.\n\n205 лифтов доступны\nдля размещения рекламы." },
        "d5": { title: "СЕЛЬМАШ 1", desc: "Сердце машиностроения, рабочие кварталы,\nстадион, парки.\n\n215 лифтов доступны\nдля размещения рекламы." },
        "d6": { title: "ЗАПАДНЫЙ", desc: "Крупный\nспальный район\nс торговыми центрами\nи рынками.\n\n80 лифтов доступны\nдля размещения рекламы." },
        "d7": { title: "СОВЕТСКИЙ 2", desc: "Университетский\nгородок и жилые\nмолодежные кварталы.\n\n240 лифтов доступны\nдля размещения рекламы." },
        "d8": { title: "СОВЕТСКИЙ 1", desc: "Новый микрорайон,\nтихие зеленые улицы\nи жилые кварталы.\n\n240 лифтов доступны\nдля размещения рекламы." },
        "d9": { title: "НОВОБЕЛИЦА", desc: "Заречная часть города,\nокруженная лесами,\nс новостройками\nи особой атмосферой.\n\n215 лифтов доступны\nдля размещения рекламы." }
    };

    const sizedata = {
        "s1": { title: "А3", desc: "Размер макета\n408 х 285 мм.\n\nСтоимость размещения\n8р. 14к." },
        "s2": { title: "А4", desc: "Размер макета\n285 х 200 мм.\n\nСтоимость размещения\n4р. 97к." },
        "s3": { title: "А5", desc: "Размер макета\n140 х 200 мм.\n\nСтоимость размещения\n3р. 4к." },
        "s4": { title: "А6", desc: "Размер макета\n140 х 98 мм.\n\nСтоимость размещения\n1р. 79к." }
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
		
		if (districtsGroup) districtsGroup.style.pointerEvents = "none";
		
		districtsTL = gsap.timeline();
		
		// 1. Мгновенная подготовка всех элементов (без цикла)
		gsap.set(districtPaths, {
			strokeDasharray: 1500, // Усредненное значение или 2000
			strokeDashoffset: 1500,
			strokeOpacity: 1,
			fillOpacity: 0,
			opacity: 1,
			stroke: "#eb7b08",
			clearProps: "transform"
		});
		gsap.set(districtTexts, { opacity: 0 });
		
		// 2. Анимация всех элементов ОДНОЙ командой через stagger
		districtsTL.to(districtPaths, {
			strokeDashoffset: 0,
			duration: 0.4,
			ease: "power2.inOut",
			stagger: 0.1 // Задержка между появлением районов
		})
		.to(districtPaths, {
			fill: "#eb7b08",
			fillOpacity: 0.2,
			duration: 0.2,
			stagger: 0.1
		}, 0.1) // Начинаем заливку чуть позже старта отрисовки
		.to(districtTexts, {
			opacity: 1,
			duration: 0.2,
			stagger: 0.1
		}, 0.1);
		
		districtsTL.add(() => {
			districtPaths.forEach(d => {
				if (d) {
					d.style.pointerEvents = "all";
					d.style.cursor = "pointer";
				}
			});
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
		
		if (sizeGroup) sizeGroup.style.pointerEvents = "none";
		sizeTL = gsap.timeline();
		
		// 1. ПОДГОТОВКА: Все макеты и тексты невидимы
		gsap.set(sizePaths, {
			opacity: 0,
			fillOpacity: 0,
			strokeOpacity: 1,
			stroke: "#eb7b08",
			strokeWidth: 10
		});
		gsap.set(sizeTexts, { opacity: 0 });
		
		// 2. ПОСЛЕДОВАТЕЛЬНОЕ ПОЯВЛЕНИЕ (4 макета)
		// stagger: 0.4 создаст ощутимую паузу между появлением контуров
		sizeTL.to(sizePaths, {
			opacity: 1,
			duration: 0.8,
			stagger: 0.5,
			ease: "power2.out"
		})
		// 3. ЗАЛИВКА: Начинается для каждого пути по мере его появления
		.to(sizePaths, {
			fill: "#eb7b08",
			fillOpacity: 0.2,
			duration: 0.4,
			stagger: 0.4
		}, 0.3) // 0.3 — это задержка старта заливки относительно первой линии
		
		// 4. ТЕКСТ: Появляется одновременно с заливкой своего контура
		.to(sizeTexts, {
			opacity: 1,
			duration: 0.4,
			stagger: 0.4
		}, 0.3);
		
		sizeTL.add(() => {
			sizePaths.forEach(s => { if (s) s.style.pointerEvents = "all"; });
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
				// Если всё уже и так сброшено — ничего не делаем. Выходим.
				if (isCurrentlyReset) return;
				
				// 1. Остановка анимации (если она шла)
				if (districtsTL) {
					districtsTL.kill(); // Полностью останавливаем прогресс
					districtsTL = null; // Очищаем ссылку
				}
				
				// Убиваем размеры (лифт)
				if (sizeTL) {
					sizeTL.kill();
					sizeTL = null;
				}
				
				// 2. Жесткое выключение интерактивности
				if (districtsGroup) {
					districtsGroup.style.pointerEvents = "none";
					districtsGroup.removeEventListener('mouseover', handleDistrictOver);
				}
				
				if (sizeGroup) {
					sizeGroup.style.pointerEvents = "none";
					sizeGroup.removeEventListener('mouseover', handleSizeOver);
				}
				
				// 3. Сброс путей (мгновенно прячем и блокируем)
				const allPaths = document.querySelectorAll('#d path');
				gsap.set(allPaths, {
					opacity: 0,
					pointerEvents: "none",
					clearProps: "all" // Очищаем всё, что наворотил GSAP
				});

				hasAnimatedDistricts = false;
				hasAnimatedSize = false;
				isCityZoneActive = false;
				isHouseTextSet = false;
				lastDistrictId = null;
				lastSizeId = null;
				
				// Прячем всё
				gsap.set(['#d path', '#d text', '#sizeGroup path', '#sizeGroup text'], {
					opacity: 0,
					pointerEvents: "none"
				});
				
				if (infoWindow) infoWindow.classList.remove('is-visible');

				// Ставим флаг, что всё очищено
				isCurrentlyReset = true;
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
				isCurrentlyReset = false;
                const cityS = (0.3 + (prog * (baseS * 0.02))) * 2;
                const cityTX = 1690;
                const cityTY = 1500;

                // Если мы в зоне дома (hProg > 0), город плавно гаснет.
                // Если мы в зоне страны (скроллим вверх), город гаснет по alphaC.
                let currentCityOpacity = alphaC;

                gsap.set(layerCity, {
                    opacity: currentCityOpacity,
                    scale: cityS,
                    x: (wW / 2) - (cityTX * cityS),
                    y: (wH / 2) - (cityTY * cityS),
                    pointerEvents: hProg > 0 ? "none" : "all",
//                    duration: 0, 
//                    overwrite: "auto"
					force3D: false
                });
            } else {
                resetAllStates();
                // Если alphaC = 0, город ОБЯЗАН быть невидимым
                gsap.set(layerCity, { opacity: 0, pointerEvents: "none" });
            }

            // --- 3. лифт---
            if (hProg > 0) {
				isCurrentlyReset = false;
                // 1. прилет
                let currentScale = hProg * (baseS * 0.73);
                let currentOpacity = Math.min(1, hProg * 4);
				
                // 2. ЭТАП: плавный зум (0.35 -> 0.55)
                if (hProg >= 1 && prog > 0.35) {
                    const zoomFactor = Math.max(0, Math.min(1, (prog - 0.35) * 4)); 
                    currentScale *= (1 + (0.15 * zoomFactor));
                }

                // 3. ЭТАП: резкий улет
                if (prog >= 0.55) {
                    const warpFactor = Math.max(0, Math.min(1, (prog - 0.55) * 30));

                    currentScale *= (1 + (0.9 * warpFactor)); 

					currentOpacity = 1 - Math.min(1, warpFactor * 2.5);
					
                    if (finalLayer) {
                    // fIn - прилет. fZoom - бесконечный рост до конца 
                        const fIn = Math.max(0, Math.min(1, (prog - 0.55) * 20));
                        const fZoom = Math.max(0, Math.min(1, (prog - 0.55) * 2.8)); 

                    // Масштаб: база * прилет * плавный рост на 20%
                        const fScale = (baseS * 0.75) * fIn * (1 + (0.20 * fZoom));
                        const targetX = 650;
                        const targetY = 400;

                        gsap.set(finalLayer, {
							force3D: true,
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

            // 4. ЕДИНЫЙ ВЫВОД
				// --- НАСТРОЙКА ПОЛОЖЕНИЯ  ---
				const LIFT_CENTER_X = 600;
				const LIFT_CENTER_Y = 500;
				
                gsap.set(house, {
					force3D: true,
                    display: (currentOpacity > 0.01) ? 'block' : 'none',
                    opacity: currentOpacity,
                    scale: currentScale,
					x: (window.innerWidth / 2) - (LIFT_CENTER_X * currentScale),
					y: (window.innerHeight / 2) - (LIFT_CENTER_Y * currentScale),
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
			
			// 1. ЗОНА: ГОРОД (Районы)
			if (alphaC >= 1 && hProg <= 0.25) {
				
				if (!isCityZoneActive) {
					isCityZoneActive = true;
					// Сбрасываем флаг следующей зоны
					isHouseTextSet = false;
					isCurrentlyReset = false;
					
					if (infoWindow) infoWindow.classList.add('is-visible');
					
					gsap.set([labelEl, districtNameEl, districtDescEl], { opacity: 1 });
					
					labelEl.textContent = "АДРЕСНАЯ ПРОГРАММА";
					districtNameEl.textContent = "1905 ЛИФТОВ";
					districtDescEl.textContent = "В 9 районах Гомеля\n1905 лифтовых кабин\nоборудованы конструкциями\nдля размещения\nрекламных материалов.\n\nМинимальный\nсрок размещения -\n2 недели.";
					
					if (districtsGroup) districtsGroup.style.pointerEvents = "none";
					animateDistrictsParade();
				}
			}
			
			// 2. ЗОНА: ЛИФТ (Размеры)
			else if (hProg >= 1 && prog < 0.55) {
				
				if (!isHouseTextSet) {
					isHouseTextSet = true;
					// Сбрасываем флаг предыдущей зоны
					isCityZoneActive = false;
					isCurrentlyReset = false;
					
					if (infoWindow) infoWindow.classList.add('is-visible');
					
					gsap.set([labelEl, districtNameEl, districtDescEl], { opacity: 1 });
					
					labelEl.textContent = "РАЗМЕРЫ МАКЕТОВ";
					districtNameEl.textContent = "А3, А4, А5, А6";
					districtDescEl.textContent = "Стенд для объявлений\nпредставляет собой\n2 ячейки формата А3.\n\nНаходясь в лифте,\nрекламное объявление\nневозможно закрыть,\nотключить, смахнуть,\nигнорировать и т.д.\n\nВашу рекламу увидят!";
					
					if (districtsGroup) districtsGroup.style.pointerEvents = "none";
					if (sizeGroup) sizeGroup.style.pointerEvents = "none";
					animateSizeParade();
				}
			}
			
			// 3. ЗОНА: ФИНАЛ (Адрес)
			else if (prog >= 0.6 && prog < 0.83) {
				
				// Если окно не видно или текст не тот — включаем
				if (!infoWindow.classList.contains('is-visible') || labelEl.textContent !== "адрес дома") {
					isCurrentlyReset = false;
					isHouseTextSet = true;
					
					if (infoWindow) infoWindow.classList.add('is-visible');
					gsap.set([labelEl, districtNameEl, districtDescEl], { opacity: 1 });
					
					labelEl.textContent = "МЫ НАХОДИМСЯ";
					districtNameEl.textContent = "Пушкинъ Плаза";
					districtDescEl.textContent = "Гомель, ул. Пушкина 2,\nцокольный этаж.\n\nВремя работы:\nПонедельник - Пятница\n9:00 - 18:00";
				}
			}
			
			// 4. ЗОНА: СБРОС (Если мы вне активных зон)
			else {

				if (!isCurrentlyReset) {
					resetAllStates();
				}
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
            const introTl = gsap.timeline();
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
