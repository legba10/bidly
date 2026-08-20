-- Bidly core schema. PostgreSQL 18.4+; uuidv7() is built into PostgreSQL 18.
-- Roll forward with a new migration. Do not edit after a production application.

create table users (
  id uuid primary key default uuidv7(),
  status text not null check (status in ('ACTIVE','SUSPENDED','CLOSED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table user_profiles (
  user_id uuid primary key references users(id) on delete cascade,
  display_name text,
  locale text not null default 'ru-RU',
  timezone text not null,
  check (display_name is null or length(display_name) between 1 and 160)
);

create table user_contacts (
  id uuid primary key default uuidv7(),
  user_id uuid not null references users(id) on delete cascade,
  kind text not null check (kind in ('EMAIL','PHONE')),
  normalized_value text not null,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  unique (kind, normalized_value)
);

create table consent_records (
  id uuid primary key default uuidv7(),
  user_id uuid not null references users(id) on delete cascade,
  consent_type text not null,
  policy_version text not null,
  source text not null,
  granted_at timestamptz not null,
  revoked_at timestamptz,
  check (revoked_at is null or revoked_at >= granted_at)
);

create table user_sessions (
  id uuid primary key default uuidv7(),
  user_id uuid not null references users(id) on delete cascade,
  secret_hash text not null unique,
  assurance_level smallint not null default 1 check (assurance_level between 1 and 3),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table user_preferences (
  user_id uuid primary key references users(id) on delete cascade,
  locale text not null default 'ru-RU',
  timezone text not null,
  notification_channels text[] not null default array['IN_APP']::text[]
);

create table user_role_assignments (
  user_id uuid not null references users(id) on delete cascade,
  role text not null check (role in ('BUYER','SUPPLIER_MEMBER','SUPPLIER_ADMIN','BIDLY_SUPPORT','BIDLY_MODERATOR','BIDLY_ADMIN')),
  granted_by uuid references users(id),
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  primary key (user_id, role, granted_at)
);

create table countries (
  id uuid primary key default uuidv7(),
  iso_code char(2) not null unique,
  name text not null
);

create table regions (
  id uuid primary key default uuidv7(),
  country_id uuid not null references countries(id),
  code text not null,
  name text not null,
  unique (country_id, code)
);

create table cities (
  id uuid primary key default uuidv7(),
  region_id uuid not null references regions(id),
  name text not null,
  timezone text not null,
  unique (region_id, name)
);

create table addresses (
  id uuid primary key default uuidv7(),
  city_id uuid not null references cities(id),
  normalized_address text not null,
  latitude_microdegrees integer check (latitude_microdegrees between -90000000 and 90000000),
  longitude_microdegrees integer check (longitude_microdegrees between -180000000 and 180000000),
  created_at timestamptz not null default now()
);

create table coverage_areas (
  id uuid primary key default uuidv7(),
  city_id uuid references cities(id),
  kind text not null check (kind in ('CITY','RADIUS','POLYGON','ADDRESS_SET')),
  definition jsonb not null check (jsonb_typeof(definition) = 'object'),
  definition_version integer not null check (definition_version > 0),
  created_at timestamptz not null default now()
);

create table coverage_addresses (
  coverage_area_id uuid not null references coverage_areas(id) on delete cascade,
  address_id uuid not null references addresses(id) on delete cascade,
  primary key (coverage_area_id, address_id)
);

create table supplier_organizations (
  id uuid primary key default uuidv7(),
  legal_name text not null,
  display_name text not null,
  inn text not null unique check (inn ~ '^(\d{10}|\d{12})$'),
  kpp text check (kpp is null or kpp ~ '^\d{9}$'),
  ogrn_or_ogrnip text not null unique check (ogrn_or_ogrnip ~ '^(\d{13}|\d{15})$'),
  legal_status text not null check (legal_status in ('LEGAL_ENTITY','INDIVIDUAL_ENTREPRENEUR')),
  verification_status text not null default 'PENDING' check (verification_status in ('PENDING','VERIFIED','REJECTED','SUSPENDED')),
  moderation_status text not null default 'PENDING' check (moderation_status in ('PENDING','APPROVED','RESTRICTED','BLOCKED')),
  billing_contact_id uuid references user_contacts(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table supplier_branches (
  id uuid primary key default uuidv7(),
  organization_id uuid not null references supplier_organizations(id),
  address_id uuid not null references addresses(id),
  display_name text not null,
  timezone text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table branch_schedules (
  id uuid primary key default uuidv7(),
  branch_id uuid not null references supplier_branches(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 1 and 7),
  opens_at time not null,
  closes_at time not null,
  valid_from date not null,
  valid_until date,
  check (closes_at > opens_at),
  check (valid_until is null or valid_until >= valid_from)
);

create table supplier_members (
  organization_id uuid not null references supplier_organizations(id),
  user_id uuid not null references users(id),
  status text not null check (status in ('INVITED','ACTIVE','SUSPENDED','REMOVED')),
  joined_at timestamptz,
  primary key (organization_id, user_id)
);

create table supplier_member_roles (
  organization_id uuid not null,
  user_id uuid not null,
  role text not null check (role in ('MEMBER','BID_MANAGER','FULFILLMENT','ADMIN')),
  granted_at timestamptz not null default now(),
  primary key (organization_id, user_id, role),
  foreign key (organization_id, user_id) references supplier_members(organization_id, user_id) on delete cascade
);

create table supplier_verifications (
  id uuid primary key default uuidv7(),
  organization_id uuid not null references supplier_organizations(id),
  status text not null check (status in ('PENDING','VERIFIED','REJECTED','SUSPENDED')),
  source text not null check (source in ('MANUAL','PROVIDER_ADAPTER')),
  provider_reference text,
  checked_at timestamptz,
  created_at timestamptz not null default now()
);

create table supplier_documents (
  id uuid primary key default uuidv7(),
  organization_id uuid not null references supplier_organizations(id),
  document_type text not null,
  object_key text not null unique,
  status text not null check (status in ('PENDING','ACCEPTED','REJECTED','EXPIRED')),
  created_at timestamptz not null default now()
);

create table supplier_coverage (
  organization_id uuid not null references supplier_organizations(id),
  coverage_area_id uuid not null references coverage_areas(id),
  source text not null check (source in ('SUPPLIER_UPLOAD','ADMIN_IMPORT','ADAPTER')),
  active boolean not null default true,
  primary key (organization_id, coverage_area_id)
);

create table categories (
  id uuid primary key default uuidv7(),
  slug text not null unique,
  name text not null,
  status text not null check (status in ('DRAFT','ACTIVE','RETIRED'))
);

create table category_versions (
  id uuid primary key default uuidv7(),
  category_id uuid not null references categories(id),
  version integer not null check (version > 0),
  market_type text not null check (market_type in ('SWITCH','CAPACITY','BULK','LEAD')),
  capacity_measure text not null check (capacity_measure in ('CONNECTION','APPOINTMENT_SLOT','INVENTORY_UNIT','LEAD')),
  multi_winner boolean not null,
  requires_coverage boolean not null,
  requires_appointment_slot boolean not null,
  requires_sku boolean not null,
  buyer_schema jsonb not null check (jsonb_typeof(buyer_schema) = 'object'),
  offer_schema jsonb not null check (jsonb_typeof(offer_schema) = 'object'),
  comparison_fields text[] not null,
  active_from timestamptz not null,
  active_until timestamptz,
  unique (category_id, version),
  check (active_until is null or active_until > active_from)
);

create table category_requirement_definitions (
  id uuid primary key default uuidv7(),
  category_version_id uuid not null references category_versions(id),
  field_key text not null,
  required boolean not null,
  schema_fragment jsonb not null check (jsonb_typeof(schema_fragment) = 'object'),
  unique (category_version_id, field_key)
);

create table category_offer_definitions (
  id uuid primary key default uuidv7(),
  category_version_id uuid not null references category_versions(id),
  field_key text not null,
  required boolean not null,
  comparison_field boolean not null,
  schema_fragment jsonb not null check (jsonb_typeof(schema_fragment) = 'object'),
  unique (category_version_id, field_key)
);

create table supplier_capabilities (
  organization_id uuid not null references supplier_organizations(id),
  category_id uuid not null references categories(id),
  status text not null check (status in ('PENDING','ACTIVE','SUSPENDED')),
  primary key (organization_id, category_id)
);

create table demand_pools (
  id uuid primary key default uuidv7(),
  category_version_id uuid not null references category_versions(id),
  status text not null check (status in ('DRAFT','OPEN','VERIFYING','LOCKED','ALLOCATING','CLOSED','CANCELLED')),
  current_version integer not null default 1 check (current_version > 0),
  created_at timestamptz not null default now()
);

create table demand_pool_versions (
  id uuid primary key default uuidv7(),
  demand_pool_id uuid not null references demand_pools(id),
  version integer not null check (version > 0),
  criteria jsonb not null check (jsonb_typeof(criteria) = 'object'),
  purchase_window_start timestamptz not null,
  purchase_window_end timestamptz not null,
  created_at timestamptz not null default now(),
  unique (demand_pool_id, version),
  check (purchase_window_end > purchase_window_start)
);

create table demand_pool_geographies (
  id uuid primary key default uuidv7(),
  demand_pool_version_id uuid not null references demand_pool_versions(id) on delete cascade,
  city_id uuid references cities(id),
  coverage_area_id uuid references coverage_areas(id),
  check ((city_id is not null)::integer + (coverage_area_id is not null)::integer = 1)
);

create unique index demand_pool_geographies_city_unique
  on demand_pool_geographies(demand_pool_version_id, city_id)
  where city_id is not null;
create unique index demand_pool_geographies_coverage_unique
  on demand_pool_geographies(demand_pool_version_id, coverage_area_id)
  where coverage_area_id is not null;

create table buyer_demands (
  id uuid primary key default uuidv7(),
  buyer_id uuid not null references users(id),
  demand_pool_id uuid references demand_pools(id),
  category_version_id uuid not null references category_versions(id),
  city_id uuid not null references cities(id),
  intent_level text not null check (intent_level in ('INTEREST','READY','COMMITTED')),
  status text not null check (status in ('DRAFT','ACTIVE','MATCHED','VERIFICATION_REQUIRED','VERIFIED','ALLOCATED','OFFER_AVAILABLE','ACCEPTED','FULFILLING','COMPLETED','CANCELLED','EXPIRED')),
  attributes jsonb not null check (jsonb_typeof(attributes) = 'object'),
  purchase_window_end timestamptz not null,
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table buyer_demand_preferences (
  demand_id uuid not null references buyer_demands(id) on delete cascade,
  preference_key text not null,
  preference_value jsonb not null,
  primary key (demand_id, preference_key)
);

create table buyer_demand_verifications (
  id uuid primary key default uuidv7(),
  demand_id uuid not null references buyer_demands(id),
  method text not null check (method in ('EXPLICIT_CONFIRMATION','EMAIL','PHONE','ADDRESS','CATEGORY_CHECK')),
  status text not null check (status in ('PENDING','VERIFIED','FAILED','EXPIRED')),
  evidence_reference text,
  verified_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table allocation_policies (
  id uuid primary key default uuidv7(),
  category_version_id uuid not null references category_versions(id),
  current_version integer not null check (current_version > 0)
);

create table allocation_policy_versions (
  id uuid primary key default uuidv7(),
  allocation_policy_id uuid not null references allocation_policies(id),
  version integer not null check (version > 0),
  weights jsonb not null check (jsonb_typeof(weights) = 'object'),
  minimum_score integer not null check (minimum_score between 0 and 10000),
  created_at timestamptz not null default now(),
  unique (allocation_policy_id, version)
);

create table auction_rule_versions (
  id uuid primary key default uuidv7(),
  version integer not null check (version > 0),
  rules jsonb not null check (jsonb_typeof(rules) = 'object'),
  created_at timestamptz not null default now()
);

create table auctions (
  id uuid primary key default uuidv7(),
  demand_pool_version_id uuid not null references demand_pool_versions(id),
  category_version_id uuid not null references category_versions(id),
  rules_version_id uuid not null references auction_rule_versions(id),
  allocation_policy_version_id uuid not null references allocation_policy_versions(id),
  mode text not null check (mode in ('SINGLE_WINNER','MULTI_WINNER')),
  status text not null check (status in ('DRAFT','COLLECTING_DEMAND','DEMAND_VERIFICATION','SUPPLIER_BIDDING','BID_VALIDATION','ALLOCATION','USER_ACCEPTANCE','BOOKING_OR_CONNECTION','SERVICE_DELIVERY','CONFIRMED','SETTLEMENT','CLOSED','CANCELLED','DISPUTED','EXPIRED','PARTIALLY_FILLED')),
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table auction_windows (
  auction_id uuid primary key references auctions(id),
  demand_collection_start timestamptz not null,
  demand_collection_end timestamptz not null,
  verification_deadline timestamptz not null,
  bidding_start timestamptz not null,
  bidding_end timestamptz not null,
  allocation_deadline timestamptz not null,
  acceptance_deadline timestamptz not null,
  fulfillment_start timestamptz not null,
  fulfillment_end timestamptz not null,
  final_close_at timestamptz not null,
  check (demand_collection_start < demand_collection_end and demand_collection_end <= verification_deadline and verification_deadline <= bidding_start and bidding_start < bidding_end and bidding_end <= allocation_deadline and allocation_deadline <= acceptance_deadline and acceptance_deadline <= fulfillment_start and fulfillment_start < fulfillment_end and fulfillment_end <= final_close_at)
);

create table auction_supplier_eligibility (
  auction_id uuid not null references auctions(id),
  organization_id uuid not null references supplier_organizations(id),
  eligible boolean not null,
  reason_code text,
  checked_at timestamptz not null default now(),
  primary key (auction_id, organization_id)
);

create table auction_status_history (
  id uuid primary key default uuidv7(),
  auction_id uuid not null references auctions(id),
  from_status text,
  to_status text not null,
  actor_id uuid not null references users(id),
  reason text,
  request_id text not null,
  occurred_at timestamptz not null default now()
);

create table bids (
  id uuid primary key default uuidv7(),
  auction_id uuid not null references auctions(id),
  organization_id uuid not null references supplier_organizations(id),
  status text not null check (status in ('DRAFT','SUBMITTED','UNDER_REVIEW','APPROVED','REJECTED','WITHDRAWN','LOCKED')),
  current_version integer not null default 1 check (current_version > 0),
  created_at timestamptz not null default now(),
  unique (auction_id, organization_id)
);

create table bid_versions (
  id uuid primary key default uuidv7(),
  bid_id uuid not null references bids(id),
  version integer not null check (version > 0),
  headline_minor bigint not null check (headline_minor >= 0),
  headline_cadence text not null check (headline_cadence in ('ONE_TIME','MONTHLY')),
  pricing_complete boolean not null,
  currency char(3) not null check (currency ~ '^[A-Z]{3}$'),
  comparison_months integer not null check (comparison_months between 1 and 120),
  total_cost_minor bigint not null check (total_cost_minor >= headline_minor),
  effective_minor bigint not null check (effective_minor >= 0),
  capacity_quantity bigint not null check (capacity_quantity > 0),
  fulfillment_start timestamptz not null,
  fulfillment_end timestamptz not null,
  category_attributes jsonb not null check (jsonb_typeof(category_attributes) = 'object'),
  locked_at timestamptz,
  created_by uuid not null references users(id),
  created_at timestamptz not null default now(),
  unique (bid_id, version),
  check (fulfillment_end > fulfillment_start)
);

create table bid_fees (
  id uuid primary key default uuidv7(),
  bid_version_id uuid not null references bid_versions(id),
  code text not null,
  amount_minor bigint not null check (amount_minor >= 0),
  currency char(3) not null check (currency ~ '^[A-Z]{3}$'),
  cadence text not null check (cadence in ('ONE_TIME','MONTHLY')),
  mandatory boolean not null,
  starts_at_month integer check (starts_at_month is null or starts_at_month > 0),
  ends_after_month integer check (ends_after_month is null or ends_after_month > 0),
  unique (bid_version_id, code)
);

create table bid_geographies (
  bid_version_id uuid not null references bid_versions(id),
  coverage_area_id uuid not null references coverage_areas(id),
  primary key (bid_version_id, coverage_area_id)
);

create table bid_terms (
  id uuid primary key default uuidv7(),
  bid_version_id uuid not null references bid_versions(id),
  term_type text not null check (term_type in ('CONDITION','INCLUSION','EXCLUSION')),
  value text not null,
  ordinal integer not null check (ordinal >= 0),
  unique (bid_version_id, term_type, ordinal)
);

create table bid_revisions (
  id uuid primary key default uuidv7(),
  bid_id uuid not null references bids(id),
  from_version_id uuid not null references bid_versions(id),
  to_version_id uuid not null references bid_versions(id),
  reason text not null,
  actor_id uuid not null references users(id),
  created_at timestamptz not null default now(),
  unique (bid_id, to_version_id)
);

create table bid_commitments (
  bid_version_id uuid primary key references bid_versions(id),
  valid_from timestamptz not null,
  valid_until timestamptz not null,
  max_capacity bigint not null check (max_capacity > 0),
  cancellation_policy_reference text not null,
  sla_reference text not null,
  check (valid_until > valid_from)
);

create table bid_validation_results (
  id uuid primary key default uuidv7(),
  bid_version_id uuid not null references bid_versions(id),
  valid boolean not null,
  validator_version text not null,
  created_at timestamptz not null default now()
);

create table bid_validation_issues (
  id uuid primary key default uuidv7(),
  validation_result_id uuid not null references bid_validation_results(id) on delete cascade,
  code text not null,
  field text,
  severity text not null check (severity in ('ERROR','WARNING'))
);

create table bid_status_history (
  id uuid primary key default uuidv7(),
  bid_id uuid not null references bids(id),
  from_status text,
  to_status text not null,
  actor_id uuid not null references users(id),
  reason text,
  occurred_at timestamptz not null default now()
);

create table supplier_capacity_limits (
  id uuid primary key default uuidv7(),
  organization_id uuid not null references supplier_organizations(id),
  category_id uuid not null references categories(id),
  max_quantity bigint not null check (max_quantity >= 0),
  source text not null check (source in ('INITIAL_MANUAL','PERFORMANCE_POLICY','ADMIN_OVERRIDE')),
  version integer not null check (version > 0),
  valid_from timestamptz not null,
  valid_until timestamptz,
  unique (organization_id, category_id, version),
  check (valid_until is null or valid_until > valid_from)
);

create table supplier_capacity_history (
  id uuid primary key default uuidv7(),
  organization_id uuid not null references supplier_organizations(id),
  category_id uuid not null references categories(id),
  offered bigint not null check (offered >= 0),
  allocated bigint not null check (allocated >= 0),
  fulfilled bigint not null check (fulfilled >= 0),
  cancelled bigint not null check (cancelled >= 0),
  recorded_at timestamptz not null default now()
);

create table capacity_pools (
  id uuid primary key default uuidv7(),
  bid_version_id uuid not null references bid_versions(id),
  organization_id uuid not null references supplier_organizations(id),
  branch_id uuid references supplier_branches(id),
  total_quantity bigint not null check (total_quantity > 0),
  created_at timestamptz not null default now()
);

create table capacity_units (
  id uuid primary key default uuidv7(),
  capacity_pool_id uuid not null references capacity_pools(id),
  kind text not null check (kind in ('TOTAL','BRANCH_DAY','BRANCH_TIME_RANGE','APPOINTMENT_SLOT','CONNECTION','INVENTORY')),
  starts_at timestamptz,
  ends_at timestamptz,
  total_quantity bigint not null check (total_quantity > 0),
  reserved_quantity bigint not null default 0 check (reserved_quantity >= 0),
  consumed_quantity bigint not null default 0 check (consumed_quantity >= 0),
  version integer not null default 1 check (version > 0),
  active boolean not null default true,
  check (reserved_quantity + consumed_quantity <= total_quantity),
  check ((starts_at is null and ends_at is null) or (starts_at is not null and ends_at is not null and ends_at > starts_at))
);

create table allocation_runs (
  id uuid primary key default uuidv7(),
  auction_id uuid not null references auctions(id),
  allocation_policy_version_id uuid not null references allocation_policy_versions(id),
  status text not null check (status in ('RUNNING','COMPLETED','FAILED')),
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table allocation_candidates (
  id uuid primary key default uuidv7(),
  allocation_run_id uuid not null references allocation_runs(id),
  buyer_demand_id uuid not null references buyer_demands(id),
  bid_version_id uuid not null references bid_versions(id),
  capacity_unit_id uuid not null references capacity_units(id),
  score integer not null check (score between 0 and 10000),
  rank integer not null check (rank > 0),
  explanation jsonb not null check (jsonb_typeof(explanation) = 'object'),
  eligible boolean not null,
  unique (allocation_run_id, buyer_demand_id, bid_version_id)
);

create table capacity_allocations (
  id uuid primary key default uuidv7(),
  capacity_unit_id uuid not null references capacity_units(id),
  allocation_candidate_id uuid not null references allocation_candidates(id),
  quantity bigint not null check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (allocation_candidate_id)
);

create table offers (
  id uuid primary key default uuidv7(),
  buyer_demand_id uuid not null references buyer_demands(id),
  buyer_id uuid not null references users(id),
  allocation_candidate_id uuid not null unique references allocation_candidates(id),
  status text not null check (status in ('AVAILABLE','VIEWED','SOFT_RESERVED','ACCEPTED','DECLINED','EXPIRED','SUPERSEDED','UNAVAILABLE','FULFILLING','COMPLETED')),
  current_version integer not null default 1 check (current_version > 0),
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create table offer_versions (
  id uuid primary key default uuidv7(),
  offer_id uuid not null references offers(id),
  version integer not null check (version > 0),
  supplier_organization_id uuid not null references supplier_organizations(id),
  bid_version_id uuid not null references bid_versions(id),
  category_version_id uuid not null references category_versions(id),
  allocation_policy_version_id uuid not null references allocation_policy_versions(id),
  capacity_unit_id uuid not null references capacity_units(id),
  branch_id uuid references supplier_branches(id),
  headline_minor bigint not null check (headline_minor >= 0),
  total_cost_minor bigint not null check (total_cost_minor >= headline_minor),
  currency char(3) not null check (currency ~ '^[A-Z]{3}$'),
  comparison_months integer not null check (comparison_months between 1 and 120),
  snapshot jsonb not null check (jsonb_typeof(snapshot) = 'object'),
  created_at timestamptz not null default now(),
  unique (offer_id, version)
);

create table offer_fallback_chain (
  buyer_demand_id uuid not null references buyer_demands(id),
  offer_id uuid not null references offers(id),
  ordinal integer not null check (ordinal >= 0),
  primary key (buyer_demand_id, ordinal),
  unique (buyer_demand_id, offer_id)
);

create table offer_status_history (
  id uuid primary key default uuidv7(),
  offer_id uuid not null references offers(id),
  from_status text,
  to_status text not null,
  actor_id uuid not null references users(id),
  occurred_at timestamptz not null default now()
);

create table capacity_reservations (
  id uuid primary key default uuidv7(),
  capacity_unit_id uuid not null references capacity_units(id),
  offer_id uuid not null references offers(id),
  buyer_id uuid not null references users(id),
  quantity bigint not null check (quantity > 0),
  status text not null check (status in ('SOFT_RESERVED','RESERVED','CONSUMED','RELEASED','EXPIRED')),
  expires_at timestamptz,
  idempotency_key text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (buyer_id, idempotency_key),
  check ((status <> 'SOFT_RESERVED') or expires_at is not null)
);

create unique index one_active_reservation_per_offer on capacity_reservations(offer_id) where status in ('SOFT_RESERVED','RESERVED','CONSUMED');

create table capacity_releases (
  id uuid primary key default uuidv7(),
  reservation_id uuid not null references capacity_reservations(id),
  quantity bigint not null check (quantity > 0),
  reason text not null check (reason in ('BUYER_CANCELLED','SUPPLIER_CANCELLED','TTL_EXPIRED','SUPERSEDED','ADMIN_OVERRIDE')),
  released_at timestamptz not null default now(),
  unique (reservation_id)
);

create table booking_slots (
  id uuid primary key default uuidv7(),
  capacity_unit_id uuid not null unique references capacity_units(id),
  branch_id uuid not null references supplier_branches(id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  check (ends_at > starts_at)
);

create table bookings (
  id uuid primary key default uuidv7(),
  offer_id uuid not null references offers(id),
  buyer_id uuid not null references users(id),
  organization_id uuid not null references supplier_organizations(id),
  slot_id uuid references booking_slots(id),
  reservation_id uuid not null references capacity_reservations(id),
  status text not null check (status in ('PENDING','SOFT_RESERVED','CONFIRMED','CANCELLED_BY_BUYER','CANCELLED_BY_SUPPLIER','NO_SHOW','ARRIVED','IN_SERVICE','COMPLETED','DISPUTED')),
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  unique (offer_id)
);

create unique index one_active_booking_per_slot on bookings(slot_id) where status in ('SOFT_RESERVED','CONFIRMED','ARRIVED','IN_SERVICE');

create table booking_status_history (
  id uuid primary key default uuidv7(),
  booking_id uuid not null references bookings(id),
  from_status text,
  to_status text not null,
  actor_id uuid not null references users(id),
  occurred_at timestamptz not null default now()
);

create table coverage_checks (
  id uuid primary key default uuidv7(),
  offer_id uuid not null references offers(id),
  address_id uuid not null references addresses(id),
  status text not null check (status in ('PENDING','AVAILABLE','UNAVAILABLE','INCONCLUSIVE')),
  source text not null check (source in ('MANUAL','SUPPLIER_DATA','ADAPTER')),
  checked_at timestamptz
);

create table connection_requests (
  id uuid primary key default uuidv7(),
  offer_id uuid not null unique references offers(id),
  coverage_check_id uuid not null references coverage_checks(id),
  status text not null check (status in ('OFFER_ACCEPTED','COVERAGE_CHECK_PENDING','COVERAGE_AVAILABLE','INSTALLATION_SELECTION','INSTALLATION_CONFIRMED','CONNECTED','COVERAGE_UNAVAILABLE','FALLBACK_OFFER')),
  version integer not null default 1 check (version > 0)
);

create table fulfillments (
  id uuid primary key default uuidv7(),
  offer_id uuid not null unique references offers(id),
  booking_id uuid references bookings(id),
  buyer_id uuid not null references users(id),
  organization_id uuid not null references supplier_organizations(id),
  status text not null check (status in ('PENDING','ARRIVED','IN_SERVICE','SUPPLIER_CONFIRMED','BUYER_CONFIRMED','CONFIRMED','DISPUTED','CANCELLED')),
  supplier_confirmed_at timestamptz,
  buyer_confirmed_at timestamptz,
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now()
);

create table fulfillment_status_history (
  id uuid primary key default uuidv7(),
  fulfillment_id uuid not null references fulfillments(id),
  from_status text,
  to_status text not null,
  actor_id uuid not null references users(id),
  occurred_at timestamptz not null default now()
);

create table bidly_passes (
  id uuid primary key default uuidv7(),
  offer_id uuid not null references offers(id),
  organization_id uuid not null references supplier_organizations(id),
  token_hash text not null unique,
  token_version integer not null check (token_version > 0),
  expires_at timestamptz not null,
  redeemed_at timestamptz,
  created_at timestamptz not null default now()
);

create table disputes (
  id uuid primary key default uuidv7(),
  fulfillment_id uuid not null references fulfillments(id),
  status text not null check (status in ('OPEN','UNDER_REVIEW','RESOLVED','REJECTED','CLOSED')),
  reason text not null check (reason in ('SERVICE_NOT_DELIVERED','PRICE_MISMATCH','CONDITION_MISMATCH','NO_SHOW','OTHER')),
  opened_by uuid not null references users(id),
  created_at timestamptz not null default now()
);

create table dispute_evidence_references (
  id uuid primary key default uuidv7(),
  dispute_id uuid not null references disputes(id),
  object_key text not null,
  kind text not null
);

create table dispute_status_history (
  id uuid primary key default uuidv7(),
  dispute_id uuid not null references disputes(id),
  from_status text,
  to_status text not null,
  actor_id uuid not null references users(id),
  occurred_at timestamptz not null default now()
);

create table conversions (
  id uuid primary key default uuidv7(),
  offer_id uuid not null unique references offers(id),
  fulfillment_id uuid not null unique references fulfillments(id),
  status text not null check (status in ('PENDING','CONFIRMED','DISPUTED','REVERSED')),
  cpa_eligible_at timestamptz
);

create table attribution_events (
  id uuid primary key default uuidv7(),
  conversion_id uuid not null references conversions(id),
  event_type text not null check (event_type in ('OFFER_ACCEPTED','BOOKING_CREATED','ARRIVED','SERVICE_COMPLETED','BUYER_CONFIRMED','SUPPLIER_CONFIRMED','CPA_ELIGIBLE')),
  status text not null check (status in ('RECORDED','CONFIRMED','DISPUTED','REVERSED')),
  evidence_reference text,
  occurred_at timestamptz not null,
  unique (conversion_id, event_type, evidence_reference)
);

create table buyer_reliability_profiles (
  buyer_id uuid primary key references users(id),
  joined_auctions integer not null default 0 check (joined_auctions >= 0),
  accepted_offers integer not null default 0 check (accepted_offers >= 0),
  completed_services integer not null default 0 check (completed_services >= 0),
  cancelled integer not null default 0 check (cancelled >= 0),
  no_show integer not null default 0 check (no_show >= 0),
  updated_at timestamptz not null default now()
);

create table supplier_performance_profiles (
  organization_id uuid primary key references supplier_organizations(id),
  allocated integer not null default 0 check (allocated >= 0),
  accepted integer not null default 0 check (accepted >= 0),
  fulfilled integer not null default 0 check (fulfilled >= 0),
  cancelled integer not null default 0 check (cancelled >= 0),
  complaints integer not null default 0 check (complaints >= 0),
  price_mismatch integer not null default 0 check (price_mismatch >= 0),
  condition_mismatch integer not null default 0 check (condition_mismatch >= 0),
  no_capacity integer not null default 0 check (no_capacity >= 0),
  on_time integer not null default 0 check (on_time >= 0),
  score_basis_points integer not null default 0 check (score_basis_points between 0 and 10000),
  formula_version text not null,
  updated_at timestamptz not null default now()
);

create table billing_accounts (
  id uuid primary key default uuidv7(),
  organization_id uuid not null unique references supplier_organizations(id),
  currency char(3) not null check (currency ~ '^[A-Z]{3}$'),
  status text not null check (status in ('ACTIVE','SUSPENDED','CLOSED'))
);

create table cpa_rules (
  id uuid primary key default uuidv7(),
  category_version_id uuid not null references category_versions(id),
  amount_minor bigint not null check (amount_minor >= 0),
  currency char(3) not null check (currency ~ '^[A-Z]{3}$'),
  valid_from timestamptz not null,
  valid_until timestamptz,
  version integer not null check (version > 0),
  unique (category_version_id, version),
  check (valid_until is null or valid_until > valid_from)
);

create table cpa_events (
  id uuid primary key default uuidv7(),
  conversion_id uuid not null unique references conversions(id),
  cpa_rule_id uuid not null references cpa_rules(id),
  amount_minor bigint not null check (amount_minor >= 0),
  currency char(3) not null check (currency ~ '^[A-Z]{3}$'),
  status text not null check (status in ('ELIGIBLE','ACCRUED','REVERSED')),
  created_at timestamptz not null default now()
);

create table supplier_invoice_records (
  id uuid primary key default uuidv7(),
  billing_account_id uuid not null references billing_accounts(id),
  period_start timestamptz not null,
  period_end timestamptz not null,
  status text not null check (status in ('DRAFT','ISSUED','CANCELLED')),
  created_at timestamptz not null default now(),
  check (period_end > period_start)
);

create table billing_ledger (
  id uuid primary key default uuidv7(),
  billing_account_id uuid not null references billing_accounts(id),
  cpa_event_id uuid not null references cpa_events(id),
  entry_type text not null check (entry_type in ('CPA_ACCRUED','CPA_REVERSED','CPA_ADJUSTED')),
  amount_minor bigint not null,
  currency char(3) not null check (currency ~ '^[A-Z]{3}$'),
  reverses_entry_id uuid references billing_ledger(id),
  occurred_at timestamptz not null default now()
);

create table idempotency_records (
  id uuid primary key default uuidv7(),
  actor_id uuid not null references users(id),
  operation text not null,
  idempotency_key text not null,
  payload_hash text not null,
  status text not null check (status in ('PROCESSING','SUCCEEDED','FAILED_RETRYABLE','FAILED_FINAL')),
  response_code text,
  response_resource_id uuid,
  response_body jsonb,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (actor_id, operation, idempotency_key)
);

create table audit_events (
  id uuid primary key default uuidv7(),
  action text not null,
  actor_id uuid not null references users(id),
  organization_id uuid references supplier_organizations(id),
  resource_type text not null,
  resource_id text not null,
  request_id text not null,
  reason text,
  safe_changes jsonb not null check (jsonb_typeof(safe_changes) = 'object'),
  occurred_at timestamptz not null default now()
);

create table outbox_events (
  id uuid primary key default uuidv7(),
  event_type text not null,
  aggregate_type text not null,
  aggregate_id text not null,
  schema_version integer not null default 1 check (schema_version > 0),
  safe_payload jsonb not null check (jsonb_typeof(safe_payload) = 'object'),
  occurred_at timestamptz not null default now(),
  available_at timestamptz not null default now(),
  claimed_at timestamptz,
  completed_at timestamptz,
  attempts integer not null default 0 check (attempts >= 0),
  last_error_code text
);

create table notifications (
  id uuid primary key default uuidv7(),
  recipient_id uuid not null references users(id),
  channel text not null check (channel in ('IN_APP','EMAIL','SMS','PUSH','TELEGRAM')),
  template_key text not null,
  safe_variables jsonb not null check (jsonb_typeof(safe_variables) = 'object'),
  status text not null check (status in ('PENDING','SENT','FAILED','CANCELLED')),
  scheduled_at timestamptz not null,
  sent_at timestamptz
);

create table retention_policies (
  id uuid primary key default uuidv7(),
  data_class text not null,
  action text not null check (action in ('DELETE','ANONYMIZE','RETAIN_RESTRICTED')),
  retention_days integer not null check (retention_days > 0),
  policy_version text not null,
  active_from timestamptz not null,
  unique (data_class, policy_version)
);

-- Purposeful hot-path indexes; add more only from query plans.
create index buyer_demands_pool_status_idx on buyer_demands(demand_pool_id, status, intent_level);
create index buyer_demands_buyer_created_idx on buyer_demands(buyer_id, created_at desc);
create index demand_pools_category_status_idx on demand_pools(category_version_id, status);
create index auctions_status_category_idx on auctions(status, category_version_id, created_at);
create index bids_auction_status_idx on bids(auction_id, status);
create index bids_organization_idx on bids(organization_id, created_at desc);
create index capacity_units_available_idx on capacity_units(capacity_pool_id, starts_at) where active and reserved_quantity + consumed_quantity < total_quantity;
create index capacity_reservations_expiry_idx on capacity_reservations(expires_at) where status = 'SOFT_RESERVED';
create index allocation_candidates_buyer_rank_idx on allocation_candidates(buyer_demand_id, rank) where eligible;
create index offers_buyer_status_idx on offers(buyer_id, status, expires_at);
create index bookings_org_slot_idx on bookings(organization_id, slot_id, status);
create index booking_slots_branch_start_idx on booking_slots(branch_id, starts_at);
create index audit_resource_idx on audit_events(resource_type, resource_id, occurred_at desc);
create index audit_actor_idx on audit_events(actor_id, occurred_at desc);
create index outbox_pending_idx on outbox_events(available_at, occurred_at) where completed_at is null;

-- Immutable evidence/history. Corrections are new rows, not rewrites.
create function bidly_reject_mutation() returns trigger language plpgsql as $$
begin
  raise exception 'immutable Bidly record cannot be updated or deleted' using errcode = '55000';
end;
$$;

create trigger bid_versions_immutable before update or delete on bid_versions for each row execute function bidly_reject_mutation();
create trigger offer_versions_immutable before update or delete on offer_versions for each row execute function bidly_reject_mutation();
create trigger auction_history_immutable before update or delete on auction_status_history for each row execute function bidly_reject_mutation();
create trigger bid_history_immutable before update or delete on bid_status_history for each row execute function bidly_reject_mutation();
create trigger offer_history_immutable before update or delete on offer_status_history for each row execute function bidly_reject_mutation();
create trigger booking_history_immutable before update or delete on booking_status_history for each row execute function bidly_reject_mutation();
create trigger fulfillment_history_immutable before update or delete on fulfillment_status_history for each row execute function bidly_reject_mutation();
create trigger dispute_history_immutable before update or delete on dispute_status_history for each row execute function bidly_reject_mutation();
create trigger attribution_events_immutable before update or delete on attribution_events for each row execute function bidly_reject_mutation();
create trigger billing_ledger_immutable before update or delete on billing_ledger for each row execute function bidly_reject_mutation();
create trigger audit_events_immutable before update or delete on audit_events for each row execute function bidly_reject_mutation();
