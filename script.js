// БАЗА ДАННЫХ
let dataset = [
    { id: 1, place: "Mövenpick Hotel Sukhumvit 15", category: "Отели", tag: "Каждый день", rating: 30, text: "Бесплатный шоколадный час для постояльцев отеля. Если вы не проживаете в отеле, можно зайти с улицы, оплатив 150 THB с человека через официальный сайт.", url: "https://movenpick.accor.com/", lat: 13.743120, lng: 100.559320 },
    { id: 2, place: "Safari World", category: "Развлечения", tag: "Для групп", rating: 45, text: "Работает каждый день. Покупать билеты на кассе дорого — используйте скидки на билеты через приложение Klook прямо у входа.", url: "https://www.klook.com/", lat: 13.865383, lng: 100.702952 },
    { id: 3, place: "Paris Mikki (Asoke)", category: "Еда", tag: "Доставка", rating: 20, text: "Остатки премиальной французской выпечки в конце дня можно урвать с огромными скидками через приложение Yindii на доставку.", url: "https://www.yindii.co/", lat: 13.738361, lng: 100.559981 },
    { id: 4, place: "Benjakitti Park", category: "Парки", tag: "Бесплатно", rating: 50, text: "Вход в парк абсолютно бесплатный. Следите за анонсами: на открытой сцене амфитеатра иногда проходят потрясающие бесплатные концерты под открытым небом.", url: "", lat: 13.729906, lng: 100.558607 }
];

let isAuthorized = false;
let map;
let markers = [];
let infoWindow;

// Новая асинхронная инициализация по стандартам Google 2024-2026
async function initMap() {
    // Импортируем необходимые библиотеки карт нового поколения
    await google.maps.importLibrary("maps");
    await google.maps.importLibrary("marker");

    const asokeCoordinates = { lat: 13.740263, lng: 100.558362 };
    
    // Для AdvancedMarkerElement обязательно требуется mapId (используем демо-id)
    map = new google.maps.Map(document.getElementById("map-container"), {
        zoom: 13,
        center: asokeCoordinates,
        mapId: "DEMO_MAP_ID" 
    });

    infoWindow = new google.maps.InfoWindow();
    renderMarkers();
}

// ОТРИСОВКА МАРКЕРОВ НОВОГО ПОКОЛЕНИЯ (AdvancedMarkerElement)
function renderMarkers() {
    markers.forEach(m => m.setMap(null));
    markers = [];

    dataset.forEach(item => {
        // Создаем красивый кастомный DOM-элемент вместо старой картинки-булавки
        const pinElement = document.createElement("div");
        pinElement.style.width = "16px";
        pinElement.style.height = "16px";
        pinElement.style.borderRadius = "50%";
        pinElement.style.border = "2px solid white";
        pinElement.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)";

        // Цвета под категории
        if (item.category === "Отели") pinElement.style.backgroundColor = "#0284c7"; // Синий
        else if (item.category === "Парки") pinElement.style.backgroundColor = "#10b981"; // Зеленый
        else if (item.category === "Еда") pinElement.style.backgroundColor = "#f97316"; // Оранжевый
        else pinElement.style.backgroundColor = "#a855f7"; // Развлечения - Фиолетовый

        // Инициализируем AdvancedMarkerElement
        const marker = new google.maps.marker.AdvancedMarkerElement({
            position: { lat: item.lat, lng: item.lng },
            map: map,
            title: item.place,
            content: pinElement
        });

        marker.addListener("click", () => {
            const htmlContent = `
                <div style="color: #1e293b; max-width: 250px; font-family: sans-serif; padding: 4px;">
                    <h3 style="margin: 0 0 4px 0; font-size: 14px; color: #0f172a; font-weight: bold;">${item.place}</h3>
                    <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 600; color: #0284c7;">${item.category}</p>
                    <p style="margin: 0; font-size: 12px; line-height: 1.4; color: #64748b;">${item.text}</p>
                </div>
            `;
            infoWindow.setContent(htmlContent);
            infoWindow.open(map, marker);
            map.panTo(marker.position);
        });

        markers.push(marker);
    });
}

// НАВИГАЦИЯ
function switchScreen(screenName) {
    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.toggle-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById(`screen-${screenName}`).classList.add('active');
    if(screenName === 'map' || screenName === 'list') {
        document.getElementById(`btn-nav-${screenName}`).classList.add('active');
    }
    
    if(screenName !== 'map' && infoWindow) {
        infoWindow.close();
    }
    
    if(screenName === 'list') { 
        renderList('Все'); 
    }
}

// СТАБИЛЬНЫЙ РЕНДЕРИНГ ЛЕНТЫ
function renderList(filterTag) {
    const container = document.getElementById('hacks-container');
    if (!container) return; 
    
    container.innerHTML = '';
    let sortedData = [...dataset].sort((a,b) => b.rating - a.rating);

    sortedData.forEach(item => {
        if(filterTag !== 'Все' && item.tag !== filterTag) return;

        const card = document.createElement('div');
        card.className = 'hack-card';
        card.innerHTML = `
            <div class="hack-info">
                <div class="hack-place">${item.place} • <span style="color: var(--primary); font-weight: 700;">${item.category}</span></div>
                <div class="hack-text">${item.text}</div>
                <div class="hack-meta">
                    <span>Тег: <strong>#${item.tag}</strong></span>
                    ${item.url ? `<a href="${item.url}" target="_blank">🔗 Источник</a>` : '<span>ℹ️ Проверено сообществом</span>'}
                </div>
            </div>
            <div class="hack-rating">
                <button class="vote-btn" onclick="vote(${item.id})">🔺</button>
                <div class="rating-num" id="rat-${item.id}">${item.rating}</div>
            </div>
        `;
        container.appendChild(card);
    });
}

function filterByTag(tag, element) {
    document.querySelectorAll('.tag-badge').forEach(el => el.classList.remove('selected'));
    if (element) element.classList.add('selected');
    renderList(tag);
}

function vote(id) {
    let target = dataset.find(x => x.id === id);
    if(target) {
        target.rating += 1;
        const ratingElement = document.getElementById(`rat-${id}`);
        if (ratingElement) ratingElement.innerText = target.rating;
    }
}

function simulateGoogleLogin() {
    isAuthorized = true;
    document.getElementById('auth-box').style.display = 'none';
    document.getElementById('welcome-box').style.display = 'flex';
    document.getElementById('header-user').style.display = 'flex';
}

// ТЕМНАЯ ТЕМА
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
}

function simulateLogout() {
    isAuthorized = false;
    document.getElementById('auth-box').style.display = 'flex';
    document.getElementById('welcome-box').style.display = 'none';
    document.getElementById('header-user').style.display = 'none';
}

function handleFormSubmit(event) {
    event.preventDefault();
    if(!isAuthorized) {
        alert("Доступ заблокирован! Пожалуйста, выполните вход через Google OAuth.");
        return;
    }

    const textInput = document.getElementById('form-text').value;
    if(textInput.trim().length < 10) return;

    const newHack = {
        id: dataset.length + 1,
        place: document.getElementById('form-place').value,
        category: document.getElementById('form-cat').value,
        tag: document.getElementById('form-tag').value,
        rating: 0,
        text: textInput,
        url: document.getElementById('form-url').value,
        lat: 13.740263 + (Math.random() - 0.5) * 0.01,
        lng: 100.5 Tib * 0.01
    };

    dataset.push(newHack);
    alert("Успешно отправлено!");
    document.getElementById('hack-form').reset();
    if (typeof google !== 'undefined') { renderMarkers(); }
    switchScreen('list');
}

// Запуск кода и автоматический вызов API после полной загрузки страницы
document.addEventListener("DOMContentLoaded", () => {
    renderList('Все');
    if (typeof google !== 'undefined') {
        initMap();
    } else {
        // Если скрипт карт загружается асинхронно, вешаем слушатель на глобальное событие окон
        window.initMap = initMap;
    }
});