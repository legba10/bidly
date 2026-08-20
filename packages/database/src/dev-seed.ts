import { Catalog } from '@bidly/domain';
import { Pool } from 'pg';

const localHosts = new Set(['127.0.0.1', 'localhost', '[::1]']);

export async function seedDevelopmentDatabase(connectionString: string): Promise<void> {
  const target = new URL(connectionString);
  if (process.env['NODE_ENV'] !== 'development' || process.env['BIDLY_ALLOW_DEV_SEED'] !== '1') {
    throw new Error('DEV ONLY seed requires NODE_ENV=development and BIDLY_ALLOW_DEV_SEED=1');
  }
  if (!localHosts.has(target.hostname) || /prod|production/iu.test(target.pathname)) {
    throw new Error('DEV ONLY seed refuses non-local or production-like database targets');
  }

  const pool = new Pool({ application_name: 'bidly-dev-seed', connectionString, max: 1 });
  const client = await pool.connect();
  try {
    await client.query('begin');
    const country = await client.query<{ id: string }>(`
      insert into countries(iso_code, name) values ('RU', 'Россия')
      on conflict (iso_code) do update set name = excluded.name
      returning id
    `);
    const countryId = country.rows[0]?.id;
    if (!countryId) throw new Error('Failed to seed DEV country');
    const region = await client.query<{ id: string }>(
      `
      insert into regions(country_id, code, name) values ($1, '86', 'Ханты-Мансийский автономный округ — Югра')
      on conflict (country_id, code) do update set name = excluded.name
      returning id
    `,
      [countryId],
    );
    const regionId = region.rows[0]?.id;
    if (!regionId) throw new Error('Failed to seed DEV region');
    await client.query(
      `
      insert into cities(region_id, name, timezone) values ($1, 'Сургут', 'Asia/Yekaterinburg')
      on conflict (region_id, name) do update set timezone = excluded.timezone
    `,
      [regionId],
    );

    for (const fixture of Catalog.developmentCategoryFixtures) {
      const category = await client.query<{ id: string }>(
        `
        insert into categories(slug, name, status) values ($1, $2, 'ACTIVE')
        on conflict (slug) do update set name = excluded.name, status = 'ACTIVE'
        returning id
      `,
        [fixture.slug, fixture.name],
      );
      const categoryId = category.rows[0]?.id;
      if (!categoryId) throw new Error(`Failed to seed DEV category ${fixture.slug}`);
      await client.query(
        `
        insert into category_versions(
          category_id, version, market_type, capacity_measure, multi_winner,
          requires_coverage, requires_appointment_slot, requires_sku,
          buyer_schema, offer_schema, comparison_fields, active_from
        ) values ($1, 1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb, $10, '2026-01-01T00:00:00Z')
        on conflict (category_id, version) do nothing
      `,
        [
          categoryId,
          fixture.marketType,
          fixture.capacityMeasure,
          fixture.multiWinner,
          fixture.requiresCoverage,
          fixture.requiresAppointmentSlot,
          fixture.requiresSku,
          JSON.stringify(Catalog.categoryJsonSchema(fixture.buyerSchema)),
          JSON.stringify(Catalog.categoryJsonSchema(fixture.offerSchema)),
          fixture.comparisonFields,
        ],
      );
    }

    await client.query(`
      insert into users(status)
      select 'ACTIVE' from generate_series(1, 3)
      where not exists (select 1 from user_profiles where display_name like 'DEV ONLY:%')
    `);
    const users = await client.query<{ id: string }>(
      `select id from users order by created_at, id limit 3`,
    );
    for (const [index, row] of users.rows.entries()) {
      await client.query(
        `
        insert into user_profiles(user_id, display_name, locale, timezone)
        values ($1, $2, 'ru-RU', 'Asia/Yekaterinburg')
        on conflict (user_id) do nothing
      `,
        [row.id, `DEV ONLY: тестовый пользователь ${String(index + 1)}`],
      );
    }

    const suppliers = [
      ['DEV ONLY: Поставщик Альфа', '0000000000', '0000000000000'],
      ['DEV ONLY: Поставщик Бета', '0000000001', '0000000000001'],
      ['DEV ONLY: Поставщик Гамма', '0000000002', '0000000000002'],
    ] as const;
    for (const [name, inn, ogrn] of suppliers) {
      await client.query(
        `
        insert into supplier_organizations(
          legal_name, display_name, inn, ogrn_or_ogrnip, legal_status,
          verification_status, moderation_status
        ) values ($1, $1, $2, $3, 'LEGAL_ENTITY', 'VERIFIED', 'APPROVED')
        on conflict (inn) do nothing
      `,
        [name, inn, ogrn],
      );
    }
    await client.query('commit');
  } catch (error: unknown) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}
