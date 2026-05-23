# Privacy Policy

**Effective date:** 2026-05-24
**Last updated:** 2026-05-24

PowerUp ("we", "our", or "us") operates the PowerUp mobile application (the "App"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service.

By using the App, you agree to the collection and use of information in accordance with this policy.

## 1. Information We Collect

We collect the following categories of information when you create an account and use the App:

### Account information

- **Email address** — used as your login identifier and for account-related communication.
- **Full name** — displayed in your profile and used to personalize the experience.
- **Phone number** — used for account verification and recovery.
- **Password** — stored only as a one-way hashed value. We never store or transmit your plaintext password.

### Profile and learning data

- Onboarding answers (e.g., learning goals, current English proficiency).
- Resume documents (PDF) that you upload to the resume builder.
- Audio recordings you create during speaking assessments and mock interviews.
- Your responses, scores, and progress within learning modules, assessments, and interviews.
- CEFR proficiency range computed from your assessment performance.

### Device and technical data

- Authentication tokens (JWT access and refresh tokens), stored on your device in the operating system's secure storage (iOS Keychain / Android Keystore via Expo SecureStore).
- Crash and error logs may be collected to diagnose issues.

We do **not** collect: precise location, contacts, SMS, photos outside the App, microphone audio outside of explicit assessment recordings, or advertising identifiers.

## 2. How We Use Your Information

We use the collected data to:

- Provide and maintain the App and its features.
- Authenticate you and secure your account.
- Generate personalized learning paths and assessments.
- Process resume documents and audio recordings to produce feedback using AI services (see Section 4).
- Diagnose technical issues and improve the App.
- Communicate with you about your account or material changes to the Service.

We do **not** sell your personal data. We do **not** use your data to train third-party advertising models.

## 3. Legal Basis for Processing

Where applicable (e.g., for users in the EU/EEA), we process your data on the following bases:

- **Performance of a contract** — to provide the Service you signed up for.
- **Legitimate interests** — to secure the Service and improve it.
- **Consent** — for any processing beyond what is necessary to provide the Service. You can withdraw consent at any time.

## 4. Third-Party Services

We use the following third-party services to operate the App. Each handles your data only to the extent necessary for the function described.

| Service                                                                  | Purpose                                              | Data shared                                                                                 |
| ------------------------------------------------------------------------ | ---------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Microsoft Azure (Container Apps, Cosmos DB for PostgreSQL, Blob Storage) | Hosts our API, database, and file storage            | All account, profile, learning, resume, and audio data                                      |
| Microsoft Azure OpenAI Service                                           | Generates personalized content, feedback, and scores | Anonymized prompts containing your resume text, audio transcripts, and assessment responses |
| Expo / EAS (Expo Application Services)                                   | App build and over-the-air update delivery           | None of your personal data — only app binary delivery                                       |

We do not transmit data to any other third-party processor.

## 5. Data Storage and Retention

- All personal data is stored in Microsoft Azure data centers (East US 2 region).
- We retain your data for as long as your account is active.
- If you delete your account, we delete or anonymize your personal data within 30 days, except where retention is required by law.

## 6. Data Security

We protect your data using:

- TLS 1.2+ for all data in transit between the App and our servers.
- Encryption at rest for database storage (Azure-managed) and blob storage.
- Password hashing using industry-standard algorithms (bcrypt).
- JWT-based authentication with short-lived access tokens and refresh token rotation.
- Secure on-device storage for authentication tokens (iOS Keychain / Android Keystore).

No method of transmission or storage is 100% secure. We continue to improve our security practices but cannot guarantee absolute security.

## 7. Your Rights

Depending on your jurisdiction, you have the right to:

- **Access** the personal data we hold about you.
- **Correct** inaccurate personal data.
- **Delete** your personal data ("right to be forgotten").
- **Object to or restrict** processing of your personal data.
- **Portability** — receive a copy of your data in a structured format.
- **Withdraw consent** at any time, where processing is based on consent.

To exercise any of these rights, email us at the address below.

## 8. Children's Privacy

The App is not directed to children under 13 (or under 16 in the EU/EEA). We do not knowingly collect personal data from children. If you believe a child has provided us with personal data, please contact us so we can delete it.

## 9. International Data Transfers

Your information may be transferred to and processed in countries other than your own. We use Azure's data center in East US 2 (United States). Where required by law, we put appropriate safeguards in place for such transfers.

## 10. Changes to This Policy

We may update this Privacy Policy from time to time. We will notify you of material changes by posting the new policy in the App and updating the "Last updated" date above. Your continued use of the App after changes become effective constitutes acceptance of the updated policy.

## 11. Contact

If you have questions about this Privacy Policy or our data practices, contact us:

- **Email:** deepakrama321@gmail.com
- **Website:** https://techwithdeepak.org
