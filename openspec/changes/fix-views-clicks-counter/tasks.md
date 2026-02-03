## 1. Database

- [x] 1.1 Create RPC function `mb_increment_provider_view(provider_uuid)` via migration
- [x] 1.2 Create RPC function `mb_log_contact_click(p_provider_id, p_contact_type, p_visitor_ip)` via migration

## 2. Frontend

- [x] 2.1 Update Instagram click to use contact_type 'instagram' instead of 'social'
- [x] 2.2 Update Facebook click to use contact_type 'facebook' instead of 'social'

## 3. Testing

- [x] 3.1 Test view count increments when visiting provider detail page
- [x] 3.2 Test contact clicks are logged with correct types (phone, whatsapp, email, website, instagram, facebook)
