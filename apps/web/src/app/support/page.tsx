import { BidlyIcon } from '@bidly/ui';
import Link from 'next/link';

import { PublicFooter, PublicHeader } from '../../components/public-navigation';

export default function SupportPage() {
  return (
    <>
      <PublicHeader />
      <main className="p5-info-page">
        <section className="p5-info-hero">
          <p className="bidly-eyebrow">Поддержка</p>
          <h1>Разберёмся с запросом, предложением или записью</h1>
          <p>
            Выберите тему — так быстрее понять следующий безопасный шаг. Не отправляйте пароль,
            одноразовый код, паспортные или платёжные данные.
          </p>
        </section>
        <section className="p5-support-grid">
          <article>
            <BidlyIcon name="users" />
            <h2>Покупателю</h2>
            <p>Вопросы о торгах, сравнении условий, выборе и согласиях.</p>
            <a href="mailto:support@bidly.ru?subject=Вопрос%20покупателя">support@bidly.ru</a>
          </article>
          <article>
            <BidlyIcon name="building" />
            <h2>Компании</h2>
            <p>Организация, предложение, capacity, исполнение или CPA.</p>
            <a href="mailto:business@bidly.ru?subject=Вопрос%20компании">business@bidly.ru</a>
          </article>
          <article>
            <BidlyIcon name="shield" />
            <h2>Безопасность</h2>
            <p>Сообщить об уязвимости или подозрительной активности.</p>
            <a href="mailto:security@bidly.ru?subject=Безопасность">security@bidly.ru</a>
          </article>
        </section>
        <section className="p5-faq p5-support-faq">
          <header>
            <p className="bidly-eyebrow">Быстрые ответы</p>
            <h2>Что можно проверить самостоятельно</h2>
          </header>
          <div>
            <details>
              <summary>Почему я не вижу предложение?</summary>
              <p>
                Проверьте этап торгов и совместимость условий. Предложение может быть ещё не готово
                или не подходить по адресу, периоду либо доступности.
              </p>
            </details>
            <details>
              <summary>Как считается полная стоимость?</summary>
              <p>
                В неё входят обязательные разовые и регулярные платежи за выбранный период, включая
                цену после промо. Разбивка видна до выбора.
              </p>
            </details>
            <details>
              <summary>Как отменить запись?</summary>
              <p>
                Откройте бронирование в кабинете и используйте доступное действие отмены. Правила
                срока и возможные ограничения показываются до подтверждения.
              </p>
            </details>
            <details>
              <summary>Когда компания увидит мои контакты?</summary>
              <p>
                Только после вашего соответствующего действия и согласия, когда контакт необходим
                для подключения или записи.
              </p>
            </details>
          </div>
        </section>
        <section className="p5-support-note">
          <BidlyIcon name="shield" />
          <div>
            <h2>Сначала безопасность</h2>
            <p>
              Bidly никогда не просит назвать пароль или код из SMS в письме. Не передавайте
              секретные данные по ссылкам из незнакомых сообщений.
            </p>
          </div>
          <Link href="/legal/privacy">Политика конфиденциальности</Link>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
