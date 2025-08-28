https://codebeautify.org/base64-to-image-converter

CMS - central management system
BMS - branch management system
SMS - school management system

# ######################## Models and How to use it ##################################3

# 📖 Central Bank User Model Schema (README)

This document explains the fields of the centralbank schema, their purpose, and recommendations for secure & effective use.

## 🧑 User Identity

# userCode

    Type: String (Unique, Required)

    Description: Unique identifier for the user (system-generated code).

    Recommendation:

    Auto-generate this using a secure sequence (not user-input).

    Index is unique to avoid duplicates.

# 📝 fullName

    Type: String (✅ Required)

    Purpose: The user’s full legal name.

    Recommendation:

    Always _trim_ whitespace.

    Add text index for searching.

# 📱 phoneNumber

    Type: String (🔒 Unique, ✅ Required)

    Purpose: Primary contact number.

    Recommendation:

    Store in E.164 format → +251911000000.

    Validate with regex.

# 🌍 realm

    Type: String (Default: "central")

    Purpose: Identifies which domain/system the user belongs to.

    Recommendation: Extendable for multi-tenant systems.

# 🛡️ role

    Type: ObjectId → Reference(Role)

    Purpose: Assigns permissions via Role-based Access Control (RBAC).

    Recommendation:

    Always populate("role") to fetch permissions.

    Manage centrally in the Roles collection.

## 🔐 Login Security

# 🔑 login.loginPassword

    Type: String (Hashed, ✅ Required, 🔒 Hidden)

    Purpose: Secure user password.

    Recommendation: use hash with crypto functions and with strong rounds of salt.

# 📂 login.lastFivePasswords

    Type: [String] (Hashed, max length: 5)

    Purpose: Prevents password reuse in 5 time rounds.

    Recommendation: Always hash stored history.

    Block setting a new password if it exists in history.

# 🔒 login.isMfaActive

    Type: Boolean (Default: false)

    Purpose: to make the system MFA enabled (2FA).

    Recommendation: ensure to enforce 2FA for more secure environment.

# 🔑 login.twoFactorSecret

    Type: Hashed String (🔒 Hidden)

    Purpose: TOTP secret for MFA apps (Google Authenticator, Authy, etc.).

    Recommendation: store it in hashed form.

# ⚡ login.loginAttemptCount

    Type: Number (Default: 0)

    Purpose: Tracks failed login attempts.

    Recommendation:

    Lock account if ≥5 failures.

    Reset on successful login.

# 🕒 login.lastLoginAttempt

    Type: Date

    Purpose: Tracks last attempt timestamp.

    Recommendation: Use with loginAttemptCount to detect brute-force.

# 🚫 login.isMaxLoginLimit

    Type: Boolean (Default: false)

    Purpose: Marks account lock from too many failed attempts.

    Recommendation: Combine with cooldowns before re-enabling login.

# 🆕 login.isDefaultPassword

    Type: Boolean (Default: true)

    Purpose: Marks if user is still using system-generated password.

    Recommendation: On first login → force password reset.

# 🔄 login.passwordChangedAt

    Type: Date

    Purpose: Tracks last password update.

    Recommendation: in every password change return 401 to force login anytime.

# 🔐 login.isLoginDisabled

    Type: Boolean (Default: false)

    Purpose: Hard lock for user login.

    Recommendation: Diable the user after 7 consecutive unseccuessful attempts.

# 📅 login.lastLoginAt

    Type: Date

    Purpose: Tracks last successful login.

    Recommendation: Use to monitor suspicious activity.

## ⚡ Account Lifecycle

# 🗑️ isDeleted

    Type: Boolean (Default: false)

    Purpose: Soft-delete marker.

    Recommendation: Always prefer soft delete.

# 👤 actionBy

    Type: ObjectId → Reference(centralbank)

    Purpose: The user who performed an action (use Default101 for default usage).

    Recommendation: Always store for auditability.

# 🕒 createdAt, updatedAt

    - Type: Date (Auto-generated)

    - Purpose: Lifecycle timestamps.

      Recommendation: Use moment time zone Addis Ababa.

                      Always store in UTC.

# Final security recommendation

1 - Use username, password and other security measures to secure the access of Databases (Like Postgres, mongo Db, Redis . . .)

2 - Put only specific urls in the allowed origin

3 - remove functions / files int eh dev utils

4 - production data flow must be routes --> decryption Middleware (May be middleware like ApproveToken and other can be added) --> validation Middleware --> controller --> service --> dal --> model

5 - change the default su Admin password

# File and Folder Structures

- The Files and Folders are arranged in the manner of:
  - app.ts as entry file.
  - then to routes -> middleware -> controller -> service -> dal -> model
  - some configuration files, typos and schemas are stored in the config file
  - utils hold the some reusable minor functions
- Each folders have their own responsibilities like
  - routes: only handles the routing
  - middlewares: only hanles midlewares
  - controllers: only handles the incoming data to service and response a success of 200
  - services: only hanles the core business logics
  - dal: only hanles the db queries, keys and db mechnisms
  - models: only holds the db schemas
  - utils: holds small minor reusable functions
  - .env: holds environment variables, vault connections, postgress connection string and etc

The above is the basic outline of How this repo is constructed.

## Endpoints

let url = ";

# Healthcheck endpoint

curl --location 'url/v1.0/schpay/api/central/auth/healthcheck'

- used to check the health of the service

# seed SAdmin endpoint

curl --location --request GET 'url/v1.0/schpay/api/central/auth/seed/superadmin' \
--header 'Content-Type: application/json' \
--data-raw '{
"sourceapp": "centralPortal",
"phonenumber": "924371450",
"password": "P@$$w0rd1212#"
}'

- used to seed the super admin manually if not working


// on sanitize password input problem
