## ADDED Requirements

### Requirement: View count increment RPC
The system SHALL provide an RPC function `mb_increment_provider_view(provider_uuid)` that atomically increments the `view_count` column for the specified provider.

#### Scenario: Increment view count
- **WHEN** the RPC `mb_increment_provider_view` is called with a valid provider UUID
- **THEN** the provider's `view_count` is incremented by 1

#### Scenario: Non-existent provider
- **WHEN** the RPC is called with a UUID that doesn't exist
- **THEN** no error is thrown (silent no-op)

### Requirement: Contact click logging RPC
The system SHALL provide an RPC function `mb_log_contact_click(p_provider_id, p_contact_type, p_visitor_ip)` that logs a contact click and increments the aggregate counter.

#### Scenario: Log contact click
- **WHEN** the RPC `mb_log_contact_click` is called with provider ID and contact type
- **THEN** a new row is inserted into `mb_contact_clicks` with the provided data
- **AND** the provider's `contact_click_count` is incremented by 1

#### Scenario: Valid contact types
- **WHEN** a contact click is logged
- **THEN** the contact_type SHALL be one of: 'phone', 'whatsapp', 'email', 'website', 'instagram', 'facebook'

### Requirement: Specific contact type tracking for social links
The frontend SHALL track Instagram and Facebook clicks with their specific contact types instead of a generic 'social' type.

#### Scenario: Instagram click tracking
- **WHEN** a user clicks the Instagram link
- **THEN** the system logs a contact click with contact_type = 'instagram'

#### Scenario: Facebook click tracking
- **WHEN** a user clicks the Facebook link
- **THEN** the system logs a contact click with contact_type = 'facebook'
