# Security Vision Admin Architecture

## Control-room URL
The admin UI lives at `/sv-control-7f3a9d/` instead of a predictable `/admin/` path. This is only an extra layer; authentication and authorization remain mandatory.

## Google Drive media
Production uploads should use a dedicated Google account/Drive. The browser must never receive service-account JSON, OAuth client secrets, refresh tokens, or private keys.

Recommended flow:
1. Admin signs in through the backend.
2. Admin selects images/videos.
3. Backend validates MIME type, size, extension and authorization.
4. Backend uploads media to a dedicated Drive folder.
5. Backend stores Drive file ID plus gallery metadata in the CMS datastore.
6. Public site receives only safe published media metadata/URLs.

## Frame adjustment metadata
Each media item can store:
- frame mode: cover, contain, portrait, landscape, square, story, wide, custom
- object position X/Y
- zoom
- border radius
- focal point
- alt text
- title/caption
- display order
- published/draft state

The Control Room already exposes the editing controls; connect persistence to `/api/admin/media/:id/frame`.

## Account migration
Keep Google Drive credentials and admin identity in environment variables/secrets, not Git. When moving this project to another GitHub account, update the deployment repository and secret values only.

## Android admin app
The Control Room is PWA-ready. For a real APK, package this authenticated admin web app in an Android shell (Trusted Web Activity/WebView) or build a native Android client against the same backend API. The APK must not contain Google credentials or privileged server secrets.

## Footer social links
Public social links should be stored as CMS settings so the administrator can change them without editing source code.
