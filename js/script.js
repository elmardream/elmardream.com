// --- Элементы структуры ---
const sectionLogo = document.querySelector('.section-logo');
const mainLogo = document.querySelector('.main-logo');
const sectionText = document.querySelector('.section-text');
const sectionIcons = document.querySelector('.section-icons');
const honeycombs = document.querySelectorAll('.honeycomb-item');
// --- Элементы логотипа (Фонарик и Пульс) ---
const clickPulse = document.querySelectorAll('.click-pulse');
const solPaths = document.querySelectorAll('#sol path');
const rippleGreen = document.querySelector('.ripple-green');
const rippleOrange = document.querySelector('.ripple-orange');
const allLights = [rippleGreen, rippleOrange, ...solPaths];
const ripples = [rippleGreen, rippleOrange];
// --- Управление контентом ---
const legalContent = document.querySelector('.legal-content');
const legalItems = document.querySelectorAll('.legal-item');
const legalTitle = document.getElementById('legal-title');
const legalText = document.getElementById('legal-text');
const legalAction = document.getElementById('legal-action');
const allInteractiveElements = [...honeycombs, ...legalItems];
const legalData = {
	welcome: {
		title: "PERSONAL PORTFOLIO",
		text: "Hi everyone!\nHope you like it and feel free to leave feedback.\nThanks!",
		action: ""
	},
	contact: {
		title: "CONTACT US",
		text: "",
		action: '<a href="mailto:solutions@elmardream.com" class="active-email">solutions@elmardream.com</a>'
	},
	privacy: {
		title: "PRIVACY POLICY",
		text: "April 6, 2026\nWe do not collect, store, or share any personal data.",
		action: ""
	},
	terms: {
		title: "TERMS OF USE",
		text: "April 6, 2026\nFeel free. Asteroid Apophis is coming.",
		action: ""
	},
	link1: {
		title: "Infolift-Gomel, LLC  |  Belarus",
		text: "",
		action: '<a href="infolift/index.html" target="_blank" class="active-link">www.infolift.by</a>'
	},
	link2: {
		title: "www.your-website-name.com",
		text: "Free space for a website that I would like to make for you.",
		action: ""
	},
	link3: {
		title: "www.your-website-name.com",
		text: "Free space for a website that I would like to make for you.",
		action: ""
	},
	link4: {
		title: "www.your-website-name.com",
		text: "Free space for a website that I would like to make for you.",
		action: ""
	},
	link5: {
		title: "www.your-website-name.com",
		text: "Free space for a website that I would like to make for you.",
		action: ""
	},
	link6: {
		title: "www.your-website-name.com",
		text: "Free space for a website that I would like to make for you.",
		action: ""
	}
};

let isWelcomeShowing = false;

// 2. Функция появления контента (Текст + Иконки)
function revealApp() {
	const tl = gsap.timeline();
	
	tl.to(sectionText, {
		opacity: 1,
		duration: 0.8,
		ease: "power2.out"
	})
	.to(honeycombs, {
		opacity: 1,
		scale: 1,
		y: 0, // Убираем сдвиг, если он был в CSS
		stagger: 0.1, // Появляются по очереди
		duration: 0.6,
		ease: "back.out(1.7)",
		pointerEvents: "auto"
	}, "-=0.4"); // Начинаем чуть раньше завершения текста
}

function showLegalInfo(type, hideClose = false) {
	const data = legalData[type];
	if (!data) return;
	
	// 1. Убираем активность со всех элементов
	allInteractiveElements.forEach(el => {
		el.classList.remove('is-active');
	});
	
	// 2. Подставляем текст в наш "Средний этаж"
	legalTitle.innerText = data.title;
	legalText.innerText = data.text;
	legalAction.innerHTML = data.action || "";
	
	// 3. Подсвечиваем активную иконку или ссылку в футере
	const activeEl = document.querySelector(`[data-info="${type}"], [href="#${type}"]`);
	if (activeEl) {
		activeEl.classList.add('is-active');
	}
	
	// 4. ГЛАВНОЕ: Показываем наш этаж (используем sectionText вместо legalOverlay)
	gsap.to(sectionText, {
		opacity: 1,
		duration: 0.6,
		pointerEvents: "auto",
		overwrite: true
	});
	
	// 5. Анимация появления текста
	gsap.fromTo(legalContent,
				{ y: 20, opacity: 0 },
				{ y: 0, opacity: 1, duration: 1.1, ease: "power2.out", overwrite: true }
				);
}

function burstHoneycombs(e) {
	// 1. АНИМАЦИЯ (Мышцы): Иконки будут "выстреливать" при каждом вызове функции

	gsap.fromTo(honeycombs,
				{ opacity: 0, scale: 0 },
				{
		opacity: 1,
		scale: 1,
		duration: 0.5,
		// Иконки начнут появляться из центра ряда и расходиться к краям
		stagger: {
			each: 0.05,
			from: "center"
		},
		ease: "back.out(2)",
		overwrite: true
	}
				);
	// 2. ИНИЦИАЛИЗАЦИЯ (Мозги): Вешаем слушатель только если его еще нет
	honeycombs.forEach(item => {
		if (item.dataset.initialized) return; // Лаконичная проверка
		
		item.addEventListener('mouseenter', () => {
			// Используем dataset вместо getAttribute — это быстрее в JS
			const infoKey = item.dataset.info;
			if (infoKey) showLegalInfo(infoKey);
		});
			// Ставим метку, что на эту иконку слушатель уже повешен
			item.dataset.initialized = "true";
		
	});
}

function getSVGPoint(e, svg) {
	const p = svg.createSVGPoint();
	p.x = e.clientX;
	p.y = e.clientY;
	return p.matrixTransform(svg.getScreenCTM().inverse());
}

// Функция, которая двигает фонарик
function moveSpotlight(e) {
	// Определяем координаты: либо от мыши (clientX), либо от первого касания (touches[0])
	const clientX = e.touches ? e.touches[0].clientX : e.clientX;
	const clientY = e.touches ? e.touches[0].clientY : e.clientY;
	
	// Передаем координаты в наш расчет точки SVG
	const point = getSVGPoint({ clientX, clientY }, mainLogo);
	
	// Показываем приветствие
	if (!isWelcomeShowing) {
		showLegalInfo('welcome', true);
		isWelcomeShowing = true;
		
		// Используем готовую константу для очистки футера
		legalItems.forEach(el => el.classList.remove('is-active'));
	
	}
	
	// Проявляем светлячков
	gsap.to(allLights, {
		opacity: 1,
		duration: 0.6,
		overwrite: "auto"
	});
	
	// Двигаем круги вслед за пальцем/курсором
	gsap.to(ripples, {
		attr: { cx: point.x, cy: point.y, r: 500 },
		opacity: 1,
		duration: 1.2,
	});
}

// 1. Запуск при старте
window.addEventListener('load', () => {
	// Небольшая пауза, чтобы градиент фона успел проявиться
	setTimeout(() => {
		showLegalInfo('welcome', true);
		// Запускаем иконки из центра экрана
		burstHoneycombs({
			clientX: window.innerWidth / 2,
			clientY: window.innerHeight / 2
		});
	}, 500);
});

// 2. Интерактив логотипа (Мышь и Тач)
mainLogo.addEventListener('mousemove', moveSpotlight);

mainLogo.addEventListener('touchmove', (e) => {
	moveSpotlight(e);
	if (e.cancelable) e.preventDefault();
}, { passive: false });

// 3. Клик / Нажатие (Взрыв и Волна)
mainLogo.addEventListener('mousedown', (e) => {
	const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
	
	// Всегда запускаем взрыв иконок (твой эффект прыжка)
	burstHoneycombs(e);
	
	// Оранжевая волна только для десктопа
	if (!isTouchDevice) {
		const point = getSVGPoint(e, mainLogo);
		gsap.killTweensOf(clickPulse);
		gsap.set(clickPulse, { attr: { cx: point.x, cy: point.y, r: 0 }, opacity: 1 });
		gsap.to(clickPulse, {
			attr: { r: 800 },
			opacity: 0,
			duration: 1.5,
			ease: "expo.out"
		});
	}
});

// 4. Уход мыши (Гасим свет)
mainLogo.addEventListener('mouseleave', () => {
	isWelcomeShowing = false;
	
	gsap.to(allLights, {
		opacity: 0,
		duration: 1.7,
		delay: 0.5,
		ease: "power2.inOut"
	});
});

// 5. Навигация в футере (Ссылки)
legalItems.forEach(item => {
	item.addEventListener('mouseenter', () => {
		const type = item.getAttribute('href').replace('#', '');
		showLegalInfo(type);
	});
});

// 6. Блокировка системного скролла (Мобилки)
document.addEventListener('touchmove', (e) => {
	const isInsideText = sectionText.contains(e.target);
	// Разрешаем скролл ТОЛЬКО внутри текстового этажа
	if (!isInsideText) {
		if (e.cancelable) e.preventDefault();
	}
}, { passive: false });
