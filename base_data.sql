INSERT INTO main_colors (box1, box2, box3, box4, triangle)
VALUES ('#FF5733', '#33FF57', '#3357FF', '#F333FF', '#FFFF33');

INSERT INTO events_days ("dayId", date, label)
VALUES 
  ('day-1', '2024-02-01 09:00:00+00', 'Day One'),
  ('day-2', '2024-02-02 09:00:00+00', 'Day Two'),
  ('day-3', '2024-02-03 09:00:00+00', 'Day Three'),
  ('day-4', '2024-02-04 09:00:00+00', 'Day Four');

INSERT INTO main_menu(label, section, "className", "subItems")
VALUES
('dashboard', 'dashboard', 'leftbutton', NULL),
('events', 'events', 'rightbutton', NULL),
('maps', 'map', 'downbutton', NULL),
('about', 'about', 'upperbutton', '[
  {
    "href": "main",
    "title": "Carousel"
  },
  {
    "href": "participants",
    "title": "Participants"
  },
  {
    "href": "citizens",
    "title": "Citizens of Honour"
  },
  {
    "href": "curated",
    "title": "Curated Members"
  },
  {
    "href": "info",
    "title": "Information"
  },
  {
    "href": "press",
    "title": "Press"
  },
  {
    "href": "last",
    "title": "GLUE international"
  },
  {
    "href": "last",
    "title": "Sponsors"
  }
]');

INSERT INTO main_links (platform, link)
VALUES 
  ('newsletter', 'https://amsterdam.us5.list-manage.com/subscribe?u=b588bd4354fa4df94fbd3803c&id=9cda67fd4c'),
  ('linkedin', 'https://www.linkedin.com/company/glue-amsterdam-connected-by-design/'),
  ('instagram', 'https://www.instagram.com/glue.amsterdam'),
  ('youtube', 'https://www.youtube.com/@GLUETV_amsterdam');

INSERT INTO about_carousel (title, description)
VALUES
('GLUE connected by design', 'A four days design-route for Amsterdam designers, the general public, architects, brands, labels, showrooms, galleries, academies and other colleagues.');

INSERT INTO about_citizens_section (title, description)
VALUES
('Creative Citizens of Honour!', 'Three creative industry leaders have been chosen each year for their outstanding contribution to the city. Discover who they are');

INSERT INTO about_curated (title, description)
VALUES
('GLUE STICKY MEMBER', 'Discover the GLUE STICKY MEMBER, a curated group of designers, architects, and creatives who have made a significant impact on the industry');

INSERT INTO about_info (title, description)
VALUES
('Information about GLUE', 'Discover the GLUE project, the GLUE Foundation, and the GLUE International initiative');

INSERT INTO about_press (title, description)
VALUES
('Press', 'Discover the GLUE project, the GLUE Foundation, and the GLUE International initiative.');

INSERT INTO about_international (title, subtitle, button_text, website,button_color)
VALUES
('GLUE International','GLUE arround the world','Visit GLUE International', 'http://glue-international.com', '#10069f')

INSERT INTO about_sponsors_header (title,description,sponsors_types)
VALUES 
('partners 2025', 'Discover the partners who stand by our side.', '
[
  {
    "label": "cultural partner"
  },
  {
    "label": "founding partner"
  },
  {
    "label": "community partner"
  },
  {
    "label": "mobility partner"
  },
  {
    "label": "funding partner"
  },
  {
    "label": "broadcasting partner"
  }
]')

INSERT INTO plans ("plan_id", "plan_label", "plan_price", "plan_type", "plan_currency", "currency_logo", "plan_description", "plan_items") VALUES ('planId-0', 'FREE PLAN', '0', 'free', 'EUR', '€', 'Free plan to get started!', '[{"label": "Access to view the GLUE map"}]');

INSERT INTO plans ("plan_id", "plan_label", "plan_price", "plan_type", "plan_currency", "currency_logo", "plan_description", "plan_items") VALUES ('planId-1', 'MEMBERSHIP ONLY', '250', 'member', 'EUR', '€', 'Membership only plan', '[{"label": "Invitation to 2/3 GLUE Community Cocktails"}, {"label": "1 personal invite for the Paradiso opening party"}, {"label": "The use of  email signature"}, {"label": "Option to upgrade to participant status"}, {"label": "Testing on add another feature."}]');

INSERT INTO plans ("plan_id", "plan_label", "plan_price", "plan_type", "plan_currency", "currency_logo", "plan_description", "plan_items") VALUES ('planId-2', 'PLAN NAME 1', '450', 'participant', 'EUR', '€', 'Membership only plan', '[{"label": "Invitation to 2/3 GLUE Community Cocktails"}, {"label": "1 personal invite for the Paradiso opening party"}, {"label": "The use of  email signature"}, {"label": "Option to upgrade to participant status"}, {"label": "Testing on add another feature."}]');

INSERT INTO plans ("plan_id", "plan_label", "plan_price", "plan_type", "plan_currency", "currency_logo", "plan_description", "plan_items") VALUES ('planId-3', 'PLAN NAME 2', '450', 'participant', 'EUR', '€', 'Membership only plan', '[{"label": "Invitation to 2/3 GLUE Community Cocktails"}, {"label": "1 personal invite for the Paradiso opening party"}, {"label": "The use of  email signature"}, {"label": "Option to upgrade to participant status"}, {"label": "Testing on add another feature."}]');

INSERT INTO plans ("plan_id", "plan_label", "plan_price", "plan_type", "plan_currency", "currency_logo", "plan_description", "plan_items") VALUES ('planId-4', 'PLAN NAME 3', '450', 'participant', 'EUR', '€', 'Membership only plan', '[{"label": "Invitation to 2/3 GLUE Community Cocktails"}, {"label": "1 personal invite for the Paradiso opening party"}, {"label": "The use of  email signature"}, {"label": "Option to upgrade to participant status"}, {"label": "Testing on add another feature."}]');

INSERT INTO plans ("plan_id", "plan_label", "plan_price", "plan_type", "plan_currency", "currency_logo", "plan_description", "plan_items") VALUES ('planId-5', 'PLAN NAME 4', '450', 'participant', 'EUR', '€', 'Membership only plan', '[{"label": "Invitation to 2/3 GLUE Community Cocktails"}, {"label": "1 personal invite for the Paradiso opening party"}, {"label": "The use of  email signature"}, {"label": "Option to upgrade to participant status"}, {"label": "Testing on add another feature."}]');

INSERT INTO plans ("plan_id", "plan_label", "plan_price", "plan_type", "plan_currency", "currency_logo", "plan_description", "plan_items") VALUES ('planId-6', 'PLAN NAME 5', '450', 'participant', 'EUR', '€', 'Membership only plan', '[{"label": "Invitation to 2/3 GLUE Community Cocktails"}, {"label": "1 personal invite for the Paradiso opening party"}, {"label": "The use of  email signature"}, {"label": "Option to upgrade to participant status"}, {"label": "Testing on add another feature."}]');
