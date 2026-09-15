# Security Vision production deployment

## Cloudflare
1. Create a D1 database named `security-vision`.
2. Run `schema.sql` against the D1 database.
3. Put the returned D1 database ID into `wrangler.toml`.
4. Set `PUBLIC_ORIGIN` to the final HTTPS domain.
5. Set `ADMIN_GOOGLE_EMAIL` to the Google account that is allowed to enter the control room.
6. Create a Google Drive folder for gallery media and set `DRIVE_FOLDER_ID`.
7. Add these as encrypted Worker secrets, never in GitHub source:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REFRESH_TOKEN`
8. In Google Cloud OAuth credentials, add this callback exactly:
   `/api/admin/auth/callback`
9. Deploy with Wrangler.

## Google Drive
The backend uses OAuth refresh credentials server-side, uploads media to the configured folder, and stores only Drive file IDs and safe metadata in D1. The browser and Android app never receive Google credentials.

## Admin
Open `/sv-control-7f3a9d/`. The route is intentionally non-obvious, but Google OAuth + email allow-list is the actual access control.

## Public site
Published media and social links are loaded from `/api/site`. If the API is temporarily unavailable, the static demo gallery remains visible.

## Android admin APK
Run the `Build Security Vision Admin APK` GitHub Actions workflow manually and supply the final admin URL. The workflow creates a debug APK artifact. A distributable signed release APK additionally requires a signing key stored as GitHub Actions secrets.

## GitHub account migration
The source has no GitHub-owner dependency. Move/copy the repository and reconnect deployment secrets. Update only deployment configuration such as `PUBLIC_ORIGIN`, D1 ID, Google OAuth values and Drive folder ID.
