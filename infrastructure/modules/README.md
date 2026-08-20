# Modules

Future modules should expose portable application needs (network, application compute, PostgreSQL, Redis-compatible cache, S3-compatible storage, load balancing, registry, observability) while isolating provider-specific resources. Do not create “universal” abstractions that hide security or availability settings.
