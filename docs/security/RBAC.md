# RBAC + ABAC policy

Authorization is server-side and deny-by-default. Roles are additive assignments, not one global user state. Supplier actions additionally require active membership in the trusted organization context, resource ownership, and a permitted resource state.

| Action                               |                   Buyer |             Supplier member |           Supplier admin |               Support |            Moderator |                  Admin |
| ------------------------------------ | ----------------------: | --------------------------: | -----------------------: | --------------------: | -------------------: | ---------------------: |
| Read/update own profile/consent      |                     own |                         own |                      own |  purpose-limited read | purpose-limited read |           audited read |
| Create/update own buyer demand       |                     own |           own buyer context |        own buyer context |                    no |                   no |      reasoned override |
| View aggregate auction demand        |            no buyer PII |            own eligible org |         own eligible org |               limited |                  yes |                    yes |
| Draft/submit bid                     |                      no | own org, granted capability |                  own org |                    no |          review only |      reasoned override |
| Change supplier members/verification |                      no |                          no |          own org members |                    no |  verification review |      reasoned override |
| Accept offer/create own booking      |      own eligible offer |           own buyer context |        own buyer context |                    no |                   no |      reasoned override |
| Confirm supplier fulfillment         | buyer confirmation only |    own org + accepted offer | own org + accepted offer | support evidence only |       dispute review |      reasoned override |
| Moderate bid/dispute                 |                      no |                          no |                       no |      collect evidence |                  yes |                    yes |
| Change financial/auction rules       |                      no |                          no |                       no |                    no |                   no | reasoned override only |
| Read audit                           |     own limited receipt |         own org safe events |      own org safe events |       purpose-limited |     moderation scope |     privileged audited |

## Trusted context

The API derives `user_id`, platform roles, session assurance, and active organization membership from the authenticated server session. An `organization_id` in a route/body is only a resource locator and must match trusted active membership. Repository queries include both organization and resource IDs. Bulk/search/export/background paths use the same policy.

`can(actor, action, resource)` evaluates role, organization membership/role, ownership, resource state/version, category/auction eligibility, and high-impact re-auth requirements. Controllers never scatter role comparisons. Denials use non-enumerating errors and safe structured security logs.

Support, Moderator, and Admin are distinct. Every override requires a reason and audit record. No role may silently rewrite immutable offers, bid history, ledger, or evidence.
