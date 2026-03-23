// Base preset
const CONFIG = {
    presets: {
        wheat: {
            name: "Пшеница (Базовый)",
            harvestTime: "Июль - Август",
            harvestCondition: "Влажность 14%",
            items: [
                { title: "Семена Пшеницы", rate: 210, unit: "кг", price: 25 }, 
                { title: "Аммиачная селитра", rate: 120, unit: "кг", price: 32 },
                { title: "Топливо (ДТ)", rate: 15, unit: "л", price: 65 }
            ]
        },
        sunflower: {
            name: "Подсолнечник (Базовый)",
            harvestTime: "Сентябрь - Октябрь",
            harvestCondition: "Влажность 8%",
            items: [
                { title: "Семена Подсолнечника", rate: 5, unit: "кг", price: 480 }, 
                { title: "Комплексное удобрение", rate: 100, unit: "кг", price: 55 },
                { title: "Фунгицид", rate: 2, unit: "л", price: 1200 }
            ]
        }
    }
};
Object.freeze(CONFIG);