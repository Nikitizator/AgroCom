document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('resources-container');
    const areaInput = document.getElementById('area');
    const presetSelect = document.getElementById('crop-preset');
    const modal = document.getElementById('modal-overlay');

    const getFullPresets = () => {
        const base = (typeof CONFIG !== 'undefined') ? CONFIG.presets : {};
        const user = JSON.parse(localStorage.getItem('userPresets')) || {};
        return { ...base, ...user };
    };

    function initApp() {
        const all = getFullPresets();
        if (!presetSelect) return;
        presetSelect.innerHTML = '';
        Object.keys(all).forEach(k => {
            const opt = document.createElement('option');
            opt.value = k; opt.textContent = all[k].name;
            presetSelect.appendChild(opt);
        });
        
        const saved = JSON.parse(localStorage.getItem('agroData'));
        if (saved?.items?.length > 0) {
            areaInput.value = saved.area || 100;
            presetSelect.value = saved.currentPreset || Object.keys(all)[0];
            container.innerHTML = '';
            saved.items.forEach(i => createCard(i.title, i.rate, i.unit, i.price));
        } else {
            applyPreset();
        }
    }

    function createCard(title = "", rate = 0, unit = "кг", price = 0) {
        const card = document.createElement('div');
        card.className = 'card res-card shadow';
        card.innerHTML = `
            <button class="btn-delete">✕</button>
            <input type="text" class="res-title" value="${title}" placeholder="Напр: Топливо / Удобрение">
            
            <div class="form-row" style="display: flex; gap: 8px; margin-bottom: 8px;">
                <div style="flex: 2;">
                    <label style="font-size: 11px; color: #64748b;">Норма (га)</label>
                    <input type="number" class="res-rate" value="${rate}" step="0.1" placeholder="0.0">
                </div>
                <div style="flex: 1;">
                    <label style="font-size: 11px; color: #64748b;">Ед. изм.</label>
                    <select class="res-unit-select">
                        <option value="кг" ${unit === 'кг' ? 'selected' : ''}>кг</option>
                        <option value="л" ${unit === 'л' ? 'selected' : ''}>л</option>
                        <option value="г" ${unit === 'г' ? 'selected' : ''}>г</option>
                    </select>
                </div>
            </div>

            <div class="form-group">
                <label style="font-size: 11px; color: #64748b;">Цена за ед. (₽)</label>
                <input type="number" class="res-price" value="${price}" step="0.01" placeholder="0.00">
            </div>

            <div class="res-stats" style="margin-top: 10px; border-top: 1px solid #f1f5f9; padding-top: 8px; font-size: 12px;">
                <div>Итого кол-во: <strong class="res-total-val">0</strong> <span class="res-total-unit">кг</span></div>
                <div style="color: #16a34a; font-weight: 600;">Стоимость: <strong class="res-total-money">0</strong> ₽</div>
            </div>
        `;
        
        card.querySelector('.btn-delete').onclick = () => { card.remove(); calculate(); };
        card.querySelectorAll('input, select').forEach(el => el.oninput = calculate);
        container.appendChild(card);
        calculate();
    }

    function calculate() {
        const area = parseFloat(areaInput?.value) || 0;
        let totalKg = 0; let totalL = 0; let totalCash = 0;
        const printBody = document.getElementById('print-table-body');
        if (printBody) printBody.innerHTML = '';

        document.querySelectorAll('.res-card').forEach(card => {
            const title = card.querySelector('.res-title').value || "Ресурс";
            const rate = parseFloat(card.querySelector('.res-rate').value) || 0;
            const price = parseFloat(card.querySelector('.res-price').value) || 0;
            const unit = card.querySelector('.res-unit-select').value;
            
            const sumQty = area * rate;
            const sumPrice = sumQty * price;
            
            card.querySelector('.res-total-val').innerText = sumQty.toFixed(1);
            card.querySelector('.res-total-unit').innerText = unit;
            card.querySelector('.res-total-money').innerText = sumPrice.toLocaleString();

            if (unit === 'кг') totalKg += sumQty;
            else if (unit === 'г') totalKg += (sumQty / 1000);
            else if (unit === 'л') totalL += sumQty;
            
            totalCash += sumPrice;
            
            if (printBody) {
                printBody.insertAdjacentHTML('beforeend', `<tr><td>${title}</td><td>${rate} ${unit}</td><td>${sumQty.toFixed(1)} ${unit}</td><td>${sumPrice.toLocaleString()}</td></tr>`);
            }
        });

        // UI
        let qtyStr = "";
        if (totalKg > 0) qtyStr += totalKg >= 1000 ? (totalKg/1000).toFixed(2) + " т " : Math.round(totalKg) + " кг ";
        if (totalL > 0) qtyStr += (qtyStr ? "+ " : "") + totalL.toFixed(1) + " л";
        
        document.getElementById('ui-grand-total').innerText = qtyStr || "0 кг";
        document.getElementById('ui-total-cost').innerText = totalCash.toLocaleString() + " ₽";
        document.getElementById('ui-area-display').innerText = area;
        document.getElementById('ui-tech-count').innerText = Math.ceil(area / 50);

        const all = getFullPresets();
        const cur = all[presetSelect?.value];
        if(cur) {
            document.getElementById('ui-harvest-time').innerText = cur.harvestTime || '—';
            document.getElementById('ui-harvest-cond').innerText = cur.harvestCondition || '—';
        }
        document.getElementById('print-date').innerText = new Date().toLocaleDateString();
        saveState();
    }

    function saveState() {
        const data = {
            area: areaInput.value,
            currentPreset: presetSelect.value,
            items: Array.from(document.querySelectorAll('.res-card')).map(c => ({
                title: c.querySelector('.res-title').value,
                rate: c.querySelector('.res-rate').value,
                unit: c.querySelector('.res-unit-select').value,
                price: c.querySelector('.res-price').value
            }))
        };
        localStorage.setItem('agroData', JSON.stringify(data));
    }

    function applyPreset() {
        const all = getFullPresets();
        const data = all[presetSelect.value];
        if (data) { 
            container.innerHTML = ''; 
            data.items.forEach(i => createCard(i.title, i.rate, i.unit, i.price || 0)); 
        }
    }

    // Pop-up window
    document.getElementById('add-new-preset').onclick = () => modal.style.display = 'flex';
    document.getElementById('close-modal').onclick = () => modal.style.display = 'none';
    
    document.getElementById('save-new-preset').onclick = () => {
        const name = document.getElementById('new-name').value;
        if (!name) return;
        const key = 'custom_' + Date.now();
        const user = JSON.parse(localStorage.getItem('userPresets')) || {};
        user[key] = {
            name, 
            harvestTime: `${document.getElementById('harvest-start').value} - ${document.getElementById('harvest-end').value}`,
            harvestCondition: document.getElementById('new-harvest-cond').value,
            items: [{ title: "", rate: 0, unit: "кг", price: 0 }]
        };
        localStorage.setItem('userPresets', JSON.stringify(user));
        initApp(); presetSelect.value = key; applyPreset();
        modal.style.display = 'none';
    };

    document.getElementById('add-resource').onclick = () => createCard();
    areaInput.oninput = calculate;
    presetSelect.onchange = applyPreset;
    initApp();
});