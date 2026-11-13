# راهنمای ادغام مسیر تولید تصویر در Cloudflare Worker موجود

این ZIP حاوی سورس Worker فعلی حساب Cloudflare نیست؛ پس Worker قبلی را با فایل جدید جایگزین نکن. فقط Handler جدید را به همان Worker اضافه کن تا مسیر چت قبلی سالم بماند.

## 1. فایل Handler

فایل `generate-image-handler.js` را به پروژه Worker اضافه کن.

## 2. اتصال به Router فعلی

در فایل اصلی Worker، Handler را import کن:

```js
import { handleStarAIImageGeneration } from "./generate-image-handler.js";
```

در ابتدای همان `fetch(request, env, ctx)` و قبل از منطق فعلی چت، این شرط را اضافه کن:

```js
const url = new URL(request.url);
if (url.pathname === "/api/public/generate-image") {
  return handleStarAIImageGeneration(request, env);
}
```

بقیه مسیرها، مخصوصاً `/api/public/chat`، باید دقیقاً به منطق فعلی Worker خودت ادامه دهند. اگر Worker تو از ساختار دیگری استفاده می‌کند، همین شرط را در Router متناظر قرار بده؛ تابع موجود چت را حذف یا بازنویسی نکن.

## 3. Cloudflare Secrets / Variables

از بخش Worker > Settings > Variables and Secrets مطمئن شو کلید Gemini به‌صورت Secret در یکی از این نام‌ها وجود دارد:

- `GEMINI_API_KEY`
- `GOOGLE_GEMINI_API_KEY`
- `GOOGLE_API_KEY`

متغیر زیر اختیاری است:

- `STAR_AI_IMAGE_MODEL` (در صورت خالی بودن، کد از `gemini-3.1-flash-image` استفاده می‌کند.)
- `STAR_AI_5_BETA_SUCCESS_RATE` (پیش‌فرض `0.2`)

کلید را به‌صورت Plain Text در GitHub یا Frontend قرار نده.

## 4. Deploy و تست

پس از Deploy، برنامه باید این Endpoint را صدا بزند:

`POST https://star-ai-gemini-api.star-ai-official-2026.workers.dev/api/public/generate-image`

Body نمونه:

```json
{
  "version": "3.0",
  "prompt": "A calm mountain lake at sunrise, photorealistic",
  "uiLanguage": "en",
  "aspectRatio": "16:9"
}
```

پاسخ موفق:

```json
{
  "image": {
    "dataUrl": "data:image/png;base64,...",
    "fileName": "star-ai-image-....png",
    "mimeType": "image/png"
  }
}
```

در صورت 404، شرط مسیریابی به Worker متصل نشده است. در صورت 503، Secret به نامی که Handler می‌خواند متصل نیست. در صورت 502، متن خطای برگشتی از Gemini را بررسی کن.
