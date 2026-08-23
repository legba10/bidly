export type DemoMarketStage = 'COLLECTING' | 'PROPOSING' | 'READY' | 'BOOKING';

export interface DemoCategory {
  readonly slug:
    'home_internet' | 'mobile_connection' | 'fitness' | 'dental_hygiene' | 'tire_service';
  readonly name: string;
  readonly shortName: string;
  readonly icon: 'location' | 'users' | 'building' | 'calendar' | 'shield';
  readonly city: string;
  readonly stage: DemoMarketStage;
  readonly stageLabel: string;
  readonly participants: number;
  readonly verified: number;
  readonly supplierCount: number;
  readonly comparableOffer: string;
  readonly oldPrice?: string;
  readonly saving: string;
  readonly availability: string;
  readonly nextAction: string;
  readonly deadline: string;
  readonly summary: string;
  readonly synonyms: readonly string[];
}

export interface DemoOffer {
  readonly id: string;
  readonly supplier: string;
  readonly totalCost: string;
  readonly price: string;
  readonly period: string;
  readonly saving: string;
  readonly rating: string;
  readonly reviews: number;
  readonly availability: string;
  readonly conditions: readonly string[];
  readonly badge?: string;
}

export const demoCategories: readonly DemoCategory[] = [
  {
    slug: 'home_internet',
    name: 'Домашний интернет',
    shortName: 'Интернет',
    icon: 'location',
    city: 'Сургут',
    stage: 'PROPOSING',
    stageLabel: 'Компании предлагают условия',
    participants: 18_421,
    verified: 7_842,
    supplierCount: 6,
    comparableOffer: '549 ₽/мес',
    oldPrice: '760 ₽/мес',
    saving: 'до 27%',
    availability: '116 подключений',
    nextAction: 'Смотреть условия',
    deadline: '01:42:18',
    summary: '500 Мбит/с, подключение 0 ₽, роутер включён',
    synonyms: ['интернет', 'wifi', 'wi-fi', 'вайфай', 'провайдер', 'домашний'],
  },
  {
    slug: 'mobile_connection',
    name: 'Мобильная связь',
    shortName: 'Связь',
    icon: 'users',
    city: 'Сургут',
    stage: 'READY',
    stageLabel: 'Предложения готовы',
    participants: 7_842,
    verified: 3_215,
    supplierCount: 4,
    comparableOffer: '299 ₽/мес',
    oldPrice: '370 ₽/мес',
    saving: 'до 19%',
    availability: '47 подключений',
    nextAction: 'Сравнить 4 предложения',
    deadline: '02:15:33',
    summary: '30 ГБ, 900 минут, перенос номера без доплаты',
    synonyms: ['мобильная', 'связь', 'сим', 'sim', 'оператор', 'тариф'],
  },
  {
    slug: 'fitness',
    name: 'Фитнес-клубы',
    shortName: 'Фитнес',
    icon: 'building',
    city: 'Тюмень',
    stage: 'COLLECTING',
    stageLabel: 'Собираем совместный спрос',
    participants: 2_608,
    verified: 1_431,
    supplierCount: 5,
    comparableOffer: '1 990 ₽/мес',
    saving: 'до 23%',
    availability: '83 абонемента',
    nextAction: 'Присоединиться',
    deadline: '2 дня',
    summary: '12 месяцев, заморозка 30 дней, без вступительного взноса',
    synonyms: ['фитнес', 'спортзал', 'спорт зал', 'зал', 'gym', 'абонемент'],
  },
  {
    slug: 'dental_hygiene',
    name: 'Профессиональная гигиена',
    shortName: 'Стоматология',
    icon: 'shield',
    city: 'Сургут',
    stage: 'BOOKING',
    stageLabel: 'Доступна запись',
    participants: 3_127,
    verified: 1_890,
    supplierCount: 8,
    comparableOffer: '2 490 ₽',
    oldPrice: '3 600 ₽',
    saving: 'до 31%',
    availability: '12 окон на неделе',
    nextAction: 'Выбрать клинику и время',
    deadline: 'до 25 августа',
    summary: 'Осмотр, AirFlow и ультразвук включены в полную стоимость',
    synonyms: ['стоматология', 'зубы', 'гигиена', 'чистка', 'airflow', 'клиника'],
  },
  {
    slug: 'tire_service',
    name: 'Шиномонтаж',
    shortName: 'Автосервис',
    icon: 'calendar',
    city: 'Нижневартовск',
    stage: 'COLLECTING',
    stageLabel: 'Собираем заявки на сезон',
    participants: 1_964,
    verified: 1_106,
    supplierCount: 7,
    comparableOffer: '2 150 ₽',
    saving: 'до 18%',
    availability: '64 окна',
    nextAction: 'Указать диаметр колёс',
    deadline: '4 дня',
    summary: 'R16, снятие и установка, балансировка и расходники',
    synonyms: ['шиномонтаж', 'шины', 'колеса', 'колёса', 'автосервис', 'резина'],
  },
] as const;

export const demoOffers: readonly DemoOffer[] = [
  {
    id: 'svyaz-plus',
    supplier: 'Связь+',
    totalCost: '6 588 ₽ за 12 месяцев',
    price: '549 ₽',
    period: '/мес',
    saving: '–27%',
    rating: '4,8',
    reviews: 1_240,
    availability: '116 из 200 подключений',
    conditions: ['500 Мбит/с', 'Подключение 0 ₽', 'Wi-Fi роутер включён'],
    badge: 'Выбор покупателей',
  },
  {
    id: 'netcom',
    supplier: 'NetCom',
    totalCost: '7 188 ₽ за 12 месяцев',
    price: '599 ₽',
    period: '/мес',
    saving: '–19%',
    rating: '4,7',
    reviews: 864,
    availability: '47 из 150 подключений',
    conditions: ['600 Мбит/с', 'Подключение 0 ₽', 'Роутер 990 ₽ один раз'],
  },
  {
    id: 'domset',
    supplier: 'ДомСеть',
    totalCost: '6 948 ₽ за 12 месяцев',
    price: '579 ₽',
    period: '/мес',
    saving: '–24%',
    rating: '4,6',
    reviews: 602,
    availability: '32 из 100 подключений',
    conditions: ['300 Мбит/с', 'Подключение 0 ₽', 'Wi-Fi роутер включён'],
  },
] as const;

export const demoBuyer = {
  name: 'Алексей',
  savedTotal: '8 184 ₽',
  savedMonth: '+2 364 ₽',
  activeAuctions: 3,
  pendingOffers: 1,
  booking: { date: '25 августа', id: 'hygiene-25-08', title: 'Профессиональная гигиена' },
  savings: [
    ['Интернет', '4 092 ₽', '–27%'],
    ['Мобильная связь', '2 364 ₽', '–19%'],
    ['Фитнес', '1 728 ₽', '–23%'],
  ] as const,
} as const;

export const demoBusiness = {
  name: 'Связь+',
  metrics: [
    { detail: '+2 за неделю', label: 'Активные торги', value: '7' },
    { detail: 'Заполнено 60%', label: 'Лимит мест', value: '300 / 500' },
    { detail: '+23 за неделю', label: 'Подключения', value: '184' },
    { detail: '+18 за неделю', label: 'Выполнено', value: '121' },
    { detail: '+4 800 ₽ за неделю', label: 'CPA к оплате', value: '24 600 ₽' },
  ] as const,
  funnel: [
    { label: 'Предложения показаны', value: 3_410 },
    { label: 'Покупатели выбрали', value: 184 },
    { label: 'Записались / подключились', value: 153 },
    { label: 'Услуга выполнена', value: 121 },
    { label: 'Подтверждено', value: 117 },
  ] as const,
  capacity: [
    { available: 4, label: '10:00–11:00' },
    { available: 0, label: '11:00–12:00' },
    { available: 2, label: '12:00–13:00' },
    { available: 3, label: '14:00–15:00' },
    { available: 5, label: '15:00–16:00' },
    { available: 4, label: '16:00–17:00' },
  ] as const,
  reviews: [
    {
      author: 'Анна С.',
      date: '20 августа',
      text: 'Быстро подключили, условия совпали с карточкой предложения.',
    },
    {
      author: 'Игорь П.',
      date: '18 августа',
      text: 'Понравилась прозрачная полная стоимость без доплат.',
    },
  ] as const,
} as const;

export function isBidlyDemoMode(): boolean {
  return process.env.NODE_ENV === 'development' && process.env['BIDLY_DEMO_MODE'] !== '0';
}

export function findDemoCategories(query: string, stage?: string): readonly DemoCategory[] {
  const normalized = query.trim().toLocaleLowerCase('ru-RU').replaceAll('ё', 'е');
  return demoCategories.filter((category) => {
    const matchesStage = !stage || stage === 'ALL' || category.stage === stage;
    if (!matchesStage) return false;
    if (!normalized) return true;
    const haystack = [category.name, category.shortName, category.city, ...category.synonyms]
      .join(' ')
      .toLocaleLowerCase('ru-RU')
      .replaceAll('ё', 'е');
    const stem = normalized.replace(/(ами|ями|ов|ев|ый|ий|ая|ое|ы|и|а|я)$/u, '');
    return haystack.includes(normalized) || (stem.length >= 3 && haystack.includes(stem));
  });
}

export function findDemoCategory(slug: string): DemoCategory | undefined {
  return demoCategories.find((category) => category.slug === slug);
}
