## 1. Database Migration

- [x] 1.1 Create migration file with subscription tables (mb_subscription_plans, mb_subscriptions, mb_subscription_payments)
- [x] 1.2 Create mb_provider_services table with indexes
- [x] 1.3 Create mb_provider_hours table with unique constraint (provider_id, day_of_week)
- [x] 1.4 Create mb_provider_promotions table with indexes
- [x] 1.5 ALTER mb_providers ADD banner_url column
- [x] 1.6 Add RLS policies for all new tables
- [x] 1.7 Seed premium plan row in mb_subscription_plans
- [x] 1.8 Add updated_at triggers for new tables
- [x] 1.9 Apply migration to Supabase and verify tables exist

## 2. Type Definitions

- [x] 2.1 Add ProviderService, ProviderHours, ProviderPromotion interfaces to types.ts
- [x] 2.2 Add DAY_NAMES constant and FREE_SERVICES_LIMIT constant
- [x] 2.3 Update Provider interface with banner_url and joined data (services, hours, promotions)
- [x] 2.4 Update SubscriptionPlan interface with price_annual and max_services

## 3. Subscription Utility & PremiumGate

- [x] 3.1 Create src/lib/utils/subscription.ts with isPremium() and getSubscriptionDaysLeft()
- [x] 3.2 Create src/lib/components/PremiumGate.svelte component
- [x] 3.3 Test PremiumGate renders upgrade prompt when not premium and children when premium

## 4. Services/Products Editor

- [x] 4.1 Create ServicesEditor.svelte with CRUD for services (add/edit/delete inline)
- [x] 4.2 Implement free tier limit check (10 services max) with upgrade prompt
- [x] 4.3 Create ServicesList.svelte for public display (name, description, price)
- [x] 4.4 Test services CRUD operations against Supabase

## 5. Business Hours Editor

- [x] 5.1 Create HoursEditor.svelte with 7-day grid (time pickers + closed toggle)
- [x] 5.2 Implement upsert logic for hours (insert or update by provider_id + day_of_week)
- [x] 5.3 Create BusinessHours.svelte for public display with today highlighting
- [x] 5.4 Test hours save and display

## 6. Banner Editor

- [x] 6.1 Extend src/lib/utils/upload.ts to support 'banner' type (1920px, 90% quality)
- [x] 6.2 Create BannerEditor.svelte with image upload/replace/delete (premium only)
- [ ] 6.3 Test banner upload, replace, and delete operations

## 7. Promotions Editor

- [x] 7.1 Create PromotionsEditor.svelte with CRUD for promotions (premium only)
- [x] 7.2 Create PromotionsList.svelte for public display (filter expired promotions)
- [ ] 7.3 Test promotions CRUD operations

## 8. Edit Page Integration (/mi-negocio)

- [x] 8.1 Load subscription, services, hours, promotions data in mi-negocio
- [x] 8.2 Compute isPremium from subscription data
- [x] 8.3 Add ServicesEditor section with free tier limit
- [x] 8.4 Add HoursEditor section (free for all)
- [x] 8.5 Add BannerEditor section wrapped in PremiumGate
- [x] 8.6 Add PromotionsEditor section wrapped in PremiumGate
- [ ] 8.7 Add SubscriptionCard component
- [x] 8.8 Test full editing flow for free and premium users

## 9. Public Profile Integration (/directorio/[id])

- [x] 9.1 Extend data fetching to load services, hours, promotions, subscription status, banner_url
- [x] 9.2 Add banner display at top of profile card
- [x] 9.3 Add ServicesList section (if provider has services)
- [x] 9.4 Add BusinessHours section (if provider has hours)
- [x] 9.5 Add PromotionsList section (if premium with active promotions)
- [x] 9.6 Test public profile displays all new sections correctly

## 10. Subscription Payment Flow

- [ ] 10.1 Create SubscriptionCard.svelte with plan display and subscribe/renew buttons
- [ ] 10.2 Implement subscription creation (insert pending row) and MercadoPago preference creation
- [ ] 10.3 Handle payment return in mi-negocio (check URL params, poll verify endpoint)
- [ ] 10.4 Verify webhook activates subscription correctly
- [ ] 10.5 Test full payment flow with MercadoPago sandbox

## 11. Plans Page Redesign

- [ ] 11.1 Redesign /planes with two-column free vs premium comparison
- [ ] 11.2 Add monthly/annual pricing toggle
- [ ] 11.3 Update feature lists for both plans
- [ ] 11.4 Add appropriate CTA buttons (auth-aware)
- [ ] 11.5 Update FAQ section with freemium questions
- [ ] 11.6 Test plans page layout on mobile and desktop

## 12. Auth Store Update

- [ ] 12.1 Add subscription_status and subscription_ends_at to MibarrioProvider interface
- [ ] 12.2 Update fetchMibarrioProvider to join mb_subscriptions
- [ ] 12.3 Test auth store correctly reflects premium status
