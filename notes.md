## Japanese Vending Machine!

A Japanese Vending Machine that a user can order products from, the user can choose products and gets
a certain discount % if a minimum amount of type per product is reached.

The user should be able to:
- Buy products
- Get a certain percentage % discount whenever an amount of products per product type (id) is reached.
- Checkout anytime
- View his current basket
- Log in with credentials 
- Get sound feedback (Optional), Get visual feedback (cmdmp3, chalk@2.4 boxen@4.0. @inquirer/prompts)
- Withdraw and add money

User data should be:
- Saved in a database (Locally, SQLITE)
- Structure: Name (UNIQUE, STRING(MAX 16 LEN)), Purchases Products, Statistics, Shopping basket
