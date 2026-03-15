document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('resources-container');
    const areaInput = document.getElementById('area');
    const presetSelect = document.getElementById('crop-preset');
    const addBtn = document.getElementById('add-resource');

    // Загрузка пресетов в Select
    function loadPresets() {
        for (let key in CONFIG.presets) {
            const opt = document.createElement('option');
            opt.value = key;
            opt.textContent = CONFIG.presets[key].name;
            presetSelect.appendChild(opt);
        }
    }

    // Создание карточки
    function createCard(title = "Новый ресурс", rate = 0) {
        const card = document.createElement('div');
        card.className = 'card res-card';
        card.innerHTML = `
            <button class="btn-delete" title="Удалить">✕</button>
            <div class="form-group">
                <input type="text" class="res-title" value="${title}" placeholder="Название">
            </div>
            <div class="form-group">
                <label>Норма ед/га</label>
                <input type="number" class="res-rate" value="${rate}" step="0.1">
            </div>
            <div class="res-info">Итого: <strong class="res-total">0</strong> <small class="res-unit">кг</small></div>
        `;

        card.querySelector('.btn-delete').onclick = () => {
            if(confirm('Удалить этот ресурс?')) { card.remove(); calculate(); }
        };

        card.querySelectorAll('input').forEach(i => i.oninput = calculate);
        container.appendChild(card);
        calculate();
    }

    // Основной расчет
    function calculate() {
        const area = parseFloat(areaInput.value) || 0;
        let totalAll = 0;
        const printBody = document.getElementById('print-table-body');
        printBody.innerHTML = '';

        document.querySelectorAll('.res-card').forEach(card => {
            const title = card.querySelector('.res-title').value;
            const rate = parseFloat(card.querySelector('.res-rate').value) || 0;
            const total = area * rate;
            
            // UI
            const unit = total >= 1000 ? 'т' : 'кг/л';
            const displayVal = total >= 1000 ? (total/1000).toFixed(2) : Math.round(total);
            card.querySelector('.res-total').innerText = displayVal;
            card.querySelector('.res-unit').innerText = unit;

            // Print Table
            printBody.insertAdjacentHTML('beforeend', `
                <tr>
                    <td>${title}</td>
                    <td>${rate}</td>
                    <td>${displayVal} ${unit}</td>
                </tr>
            `);
            totalAll += total;
        });

        const finalGrand = totalAll >= 1000 ? (totalAll/1000).toFixed(2) + ' т' : Math.round(totalAll) + ' кг/л';
        document.getElementById('print-grand-total').innerText = finalGrand;
        document.getElementById('print-area').innerText = area;
        document.getElementById('print-date').innerText = "Сформировано: " + new Date().toLocaleDateString();
        
        saveToLocal(); // Сохраняем состояние
    }

    // Сохранение в память браузера
    function saveToLocal() {
        const data = {
            area: areaInput.value,
            items: Array.from(document.querySelectorAll('.res-card')).map(c => ({
                title: c.querySelector('.res-title').value,
                rate: c.querySelector('.res-rate').value
            }))
        };
        localStorage.setItem('agroData', JSON.stringify(data));
    }

    // Загрузка из памяти
    function loadFromLocal() {
        const saved = localStorage.getItem('agroData');
        if (saved) {
            const data = JSON.parse(saved);
            areaInput.value = data.area;
            data.items.forEach(i => createCard(i.title, i.rate));
        } else {
            presetSelect.dispatchEvent(new Event('change'));
        }
    }

    addBtn.onclick = () => createCard();
    areaInput.oninput = calculate;
    presetSelect.onchange = (e) => {
        container.innerHTML = '';
        CONFIG.presets[e.target.value].items.forEach(i => createCard(i.title, i.rate));
    };

    loadPresets();
    loadFromLocal();
});