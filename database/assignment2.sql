-- Task 1: Insert a new record into the account table
INSERT INTO public.account (account_firstname, account_lastname, account_email, account_password)
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

-- Task 2: Modify the Tony Stark record to change account_type to 'Admin'
UPDATE public.account
SET account_type = 'Admin'
WHERE account_email = 'tony@starkent.com';

-- Task 3: Delete the Tony Stark record
DELETE FROM public.account
WHERE account_email = 'tony@starkent.com';

-- Task 4: Modify the GM Hummer record to change 'small interiors' to 'a huge interior'
UPDATE public.inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_make = 'GM' AND inv_model = 'Hummer';

-- Task 5: Select make, model, and classification_name for Sport category using INNER JOIN
SELECT i.inv_make, i.inv_model, c.classification_name
FROM public.inventory i
INNER JOIN public.classification c ON i.classification_id = c.classification_id
WHERE c.classification_name = 'Sport';

-- Task 6: Update inv_image and inv_thumbnail to add '/vehicles' to the file path
UPDATE public.inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');