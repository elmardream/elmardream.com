const mainLogo = document.querySelector('.main-logo');
const clickPulse = document.querySelectorAll('.click-pulse');
const solPaths = document.querySelectorAll('#sol path');
const rippleGreen = document.querySelector('.ripple-green');
const rippleOrange = document.querySelector('.ripple-orange');
const allLights = [rippleGreen, rippleOrange, ...solPaths];
const ripples = [rippleGreen, rippleOrange];
const honeycombs = document.querySelectorAll('.honeycomb-item');
const legalContent = document.querySelectorAll('.legal-content');
const closeBtn = document.querySelector('.legal-close');
const legalItems = document.querySelectorAll('.legal-item');
const legalOverlay = document.getElementById('legal-overlay');
const legalTitle = document.getElementById('legal-title');
const legalText = document.getElementById('legal-text');
const legalAction = document.getElementById('legal-action');
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

function showLegalInfo(type, hideClose = false) {
	const data = legalData[type];
	if (!data) return;
	
	// Гасим ВСЕ активные элементы на странице
	document.querySelectorAll('.honeycomb-item, .legal-item').forEach(el => {
		el.classList.remove('is-active');
	});
	
	// Обновляем текст в оверлее
	legalTitle.innerText = data.title;
	legalText.innerText = data.text;
	legalAction.innerHTML = data.action || "";
	
	// Сброс активных классов
	honeycombs.forEach(el => el.classList.remove('is-active'));

	// АКТИВАЦИЯ
	// Ищем элемент, у которого либо data-info равно нашему типу,
	// либо href ведет на этот тип (для футера)
	const activeEl = document.querySelector(`[data-info="${type}"], [href="#${type}"]`);
	
	if (activeEl) {
		activeEl.classList.add('is-active');
	}
	
	// ПРОВЕРКА КНОПКИ
	if (closeBtn) {
		closeBtn.style.display = hideClose ? 'none' : 'block';
	}
	
	legalOverlay.classList.add('is-visible');
	
	// АНИМАЦИЯ: Мягкое появление текста
	gsap.fromTo(".legal-content",
				{ force3D: true, willChange: "transform", y: 20, opacity: 0 },
				{ y: 0, opacity: 1, duration: 1.1, ease: "power2.out", overwrite: true }
				);
}

function burstHoneycombs(e) {
	const rect = mainLogo.getBoundingClientRect();
	
	// Расчет точки клика относительно центра логотипа
	const clickX = ((e.clientX - (rect.left + rect.width / 2)) / rect.width) * 100;
	const clickY = ((e.clientY - (rect.top + rect.height / 2)) / rect.height) * 100;
									  
	honeycombs.forEach(item => {
		const style = window.getComputedStyle(item);
		const itemX = parseFloat(style.left) || 0;
		const itemY = parseFloat(style.top) || 0;
		
		const distance = Math.sqrt(
			Math.pow(clickX - itemX, 2) + Math.pow(clickY - itemY, 2)
								   );
		const delay = distance * 0.001;
		
		// При наведении — показываем инфо в оверлее
		item.addEventListener('mouseenter', () => {
		const infoKey = item.getAttribute('data-info');
			if (infoKey) {
				showLegalInfo(infoKey);
			}
		});
		
		// Запуск анимации
		gsap.fromTo(item, {force3D: true, willChange: "transform",
			opacity: 0,
			scale: 0,
		},
					{
			opacity: 1,
			scale: 1,
			duration: 0.5,
			delay: delay,
			ease: "back.out(1.7)",
			clearProps: "will-change",
			overwrite: true
		}
					);
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

window.addEventListener('DOMContentLoaded', () => {
		
	window.addEventListener('load', () => {
		setTimeout(() => {
			// Используем функцию
			showLegalInfo('welcome');
			// иконки еще не появились - передаем "фейковое" событие с координатами центра экрана
			burstHoneycombs({
				clientX: window.innerWidth / 2,
				clientY: window.innerHeight / 2
			});
		}, 200);
	});
});

// Слушаем курсор на ссылках в футере
legalItems.forEach(item => {
	item.addEventListener('mouseenter', (e) => {
		const type = item.getAttribute('href').replace('#', '');
		// вызываем функцию
		showLegalInfo(type);
	});
});



mainLogo.addEventListener('mousemove', moveSpotlight);
mainLogo.addEventListener('touchmove', (e) => {
	moveSpotlight(e);
	// Это ВАЖНО: блокируем системный сдвиг экрана, пока палец на логотипе
	if (e.cancelable) e.preventDefault();
	// Показываем приветствие только ОДИН РАЗ при входе
	if (!isWelcomeShowing) {
		showLegalInfo('welcome');
		isWelcomeShowing = true;
	}
	
}, { passive: false });

// mainLogo.addEventListener('mousemove', (e) => {
//	const point = getSVGPoint(e, mainLogo);
	
//	gsap.to(allLights, {
//		opacity: 1,
//		duration: 0.6,
//		overwrite: "auto"
//	});
//	
//	gsap.to(ripples, {
//		attr: { cx: point.x, cy: point.y, r: 500 },
//		opacity: 1,
//		duration: 1.2,
//	});
	
	
//});

mainLogo.addEventListener('mousedown', (e) => {
	
	// Проверяем: это устройство с мышкой (hover) или сенсорное?
	const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
	
	// Вызываем функцию
	burstHoneycombs(e);
	
	// 3. УСЛОВИЕ ДЛЯ ВОЛНЫ: запускаем пульс только если это НЕ сенсорный экран
	if (!isTouchDevice) {
		
		// Рассчитываем точку для импульса
		const point = getSVGPoint(e, mainLogo);
		
		// Анимируем импульс
		gsap.killTweensOf(clickPulse);
		gsap.set(clickPulse, {force3D: true,
			attr: { cx: point.x, cy: point.y, r: 0 },
			opacity: 1
		});
		
		gsap.to(clickPulse, {
			attr: { r: 800 },
			opacity: 0,
			duration: 1.5,
			ease: "expo.out",
			overwrite: true
		});
	}
});

mainLogo.addEventListener('mouseleave', () => {
	
	isWelcomeShowing = false;
	
	gsap.to(allLights, {
		opacity: 0,
		duration: 1.7,
		delay: 0.9,
		ease: "power2.inOut",
	});
});

// Запрещаем "оттягивание" и скролл всей страницы при касании
//document.addEventListener('touchmove', function(e) {
//	if (e.target.closest('.scene-container')) {
//		e.preventDefault();
//	}
//}, { passive: false });

document.addEventListener('touchmove', function(e) {
	// Блокируем движение для всего, кроме случаев, когда внутри оверлея нужно что-то прокрутить
//	if (!e.target.closest('.legal-overlay')) {
//		e.preventDefault();
//	}
}, { passive: false });
