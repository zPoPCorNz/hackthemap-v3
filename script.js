// БАЗА ДАННЫХ: Локальные данные, синхронизированные с PostgreSQL
let dataset = [
    { id: 1, place: "Mövenpick Hotel Sukhumvit 15", category: "Отели", tag: "Каждый день", rating: 30, text: "Бесплатный шоколадный час для постояльцев отеля. Если вы не проживаете в отель, можно зайти с улицы, оплатив 150 THB с человека через официальный сайт.", url: "https://movenpick.accor.com/", lat: 13.743120, lng: 100.559320 },
    { id: 2, place: "Safari World", category: "Развлечения", tag: "Для групп", rating: 45, text: "Работает каждый день. Покупать билеты на кассе дорого — используйте скидки на билеты через приложение Klook.", url: "https://www.klook.com/", lat: 13.865383, lng: 100.702952 },
    { id: 3, place: "Paris Mikki (Asoke)", category: "Еда", tag: "Доставка", rating: 20, text: "Остатки премиальной французской выпечки в конце дня можно урвать с огромными скидками через приложение Yindii на доставку.", url: "https://www.yindii.co/", lat: 13.738361, lng: 100.559981 },
    { id: 4, place: "Benjakitti Park", category: "Парки", tag: "Бесплатно", rating: 50, text: "Вход в парк абсолютно бесплатный. Следите за анонсами: на открытой сцене амфитеатра иногда проходят потрясающие бесплатные концерты под открытым небом.", url: "", lat: 13.729906, lng: 100.558607 }
];

let isAuthorized = false;
let map;
let markers = [];

// ИНИЦИАЛИЗАЦИЯ И УПРАВЛЕНИЕ GOOGLE MAPS
function initMap() {
    const asokeCoordinates = { lat: 13.740263, lng: 100.558362 };
    
    map = new google.maps.Map(document.getElementById("map-container"), {
        zoom: 13,
        center: asokeCoordinates
    });

    renderMarkers();
}

function renderMarkers() {
    // Удаляем старые маркеры с карты
    markers.forEach(m => m.setMap(null));
    markers = [];

    // Расставляем маркеры заново
    dataset.forEach(item => {
        const marker = new google.maps.Marker({
            position: { lat: item.lat, lng: item.lng },
            map: map,
            title: item.place,
            animation: google.maps.Animation.DROP
        });

        marker.addListener("click", () => {
            showMapPopup(item.place, item.category, item.text);
            map.panTo(marker.getPosition());
        });

        markers.push(marker);
    });
}

function showMapPopup(name, cat, text) {
    const popup = document.getElementById('map-popup');
    document.getElementById('popup-name').innerText = name;
    document.getElementById('popup-cat').innerText = cat;
    document.getElementById('popup-text').innerText = text;
    popup.style.display = 'block';
}

// НАВИГАЦИЯ МЕЖДУ ЭКРАНАМИ (SPA)
function switchScreen(screenName) {
    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.toggle-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById(`screen-${screenName}`).classList.add('active');
    if(screenName === 'map' || screenName === 'list') {
        document.getElementById(`btn-nav-${screenName}`).classList.add('active');
    }
    if(screenName === 'list') { renderList('Все'); }
}

// РЕНДЕРИНГ И ФИЛЬТРАЦИЯ ЛЕНТЫ ЛАЙФХАКОВ
function renderList(filterTag) {
    const container = document.getElementById('hacks-container');
    container.innerHTML = '';
    
    // Сортировка по убыванию рейтинга полезности
    let sortedData = [...dataset].sort((a,b) => b.rating - a.rating);

    sortedData.forEach(item => {
        if(filterTag !== 'Все' && item.tag !== filterTag) return;

        const card = document.createElement('div');
        card.className = 'hack-card';
        card.innerHTML = `
            <div class="hack-info">
                <div class="hack-place">${item.place} • <span style="color: var(--primary); font-weight: 600;">${item.category}</span></div>
                <div class="hack-text">${item.text}</div>
                <div class="hack-meta">
                    <span>Тег: <strong>#${item.tag}</strong></span>
                    ${item.url ? `<a href="${item.url}" target="_blank">🔗 Открыть источник</a>` : '<span>ℹ️ Проверено сообществом</span>'}
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
    element.classList.add('selected');
    renderList(tag);
}

function vote(id) {
    let target = dataset.find(x => x.id === id);
    if(target) {
        target.rating += 1;
        document.getElementById(`rat-${id}`).innerText = target.rating;
    }
}

// ИМИТАЦИЯ GOOGLE OAUTH АВТОРИЗАЦИИ
function simulateGoogleLogin() {
    isAuthorized = true;
    document.getElementById('auth-box').style.display = 'none';
    document.getElementById('welcome-box').style.display = 'flex';
    document.getElementById('header-user').style.display = 'flex';
}

function simulateLogout() {
    isAuthorized = false;
    document.getElementById('auth-box').style.display = 'flex';
    document.getElementById('welcome-box').style.display = 'none';
    document.getElementById('header-user').style.display = 'none';
}

// ВАЛИДАЦИЯ И ОБРАБОТКА ФОРМЫ (Имитация DML)
function handleFormSubmit(event) {
    event.preventDefault();
    
    if(!isAuthorized) {
        alert("Доступ заблокирован! Пожалуйста, выполните вход через Google OAuth.");
        return;
    }

    const textInput = document.getElementById('form-text').value;
    const errorElement = document.getElementById('text-error');

    if(textInput.trim().length < 10) {
        errorElement.style.display = 'block';
        return;
    } else {
        errorElement.style.display = 'none';
    }

    // Создаем новый объект с динамической геолокацией в районе Асок
    const newHack = {
        id: dataset.length + 1,
        place: document.getElementById('form-place').value,
        category: document.getElementById('form-cat').value,
        tag: document.getElementById('form-tag').value,
        rating: 0,
        text: textInput,
        url: document.getElementById('form-url').value,
        lat: 13.740263 + (Math.random() - 0.5) * 0.01,
        lng: 100.558362 + (Math.random() - 0.5) * 0.01
    };

    dataset.push(newHack);
    alert("Успешно отправлено! Лайфхак сохранен в базе со статусом 'pending' и ожидает проверки модератором Anil.");
    document.getElementById('hack-form').reset();
    
    // Перерисовываем маркеры на карте, если она загружена
    if (typeof google !== 'undefined' && google.maps) { renderMarkers(); }
    switchScreen('list');
}

// Стартовый рендеринг списка
renderList('Все');