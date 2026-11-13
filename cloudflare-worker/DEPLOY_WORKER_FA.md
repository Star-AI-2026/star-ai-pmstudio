# نصب Worker یکپارچه Star-AI در Cloudflare

این پوشه شامل فایل کامل Worker است؛ نه یک Handler جداگانه.

## فایل مورد استفاده

`worker.js`

این فایل هر دو مسیر زیر را مدیریت می‌کند:

- `POST /api/public/chat` برای چت و جست‌وجوی وب فعلی
- `POST /api/public/generate-image` برای تولید مستقیم تصویر با Gemini

همچنین مسیر `GET /` وضعیت سرویس و مدل‌های تنظیم‌شده را نشان می‌دهد.

## روش نصب در Cloudflare Dashboard

1. وارد Cloudflare Dashboard شو.
2. به Workers & Pages برو و Worker فعلی `star-ai-gemini-api` را باز کن.
3. بخش Edit code را باز کن.
4. محتوای کد فعلی Worker را با محتوای کامل `worker.js` جایگزین کن.
5. Deploy را بزن.
6. Secret موجود `GEMINI_API_KEY` را حذف یا تغییر نده؛ همین کلید برای چت و تولید تصویر استفاده می‌شود.

این کد، مسیر چت قبلی و اتصال Tavily را حفظ کرده و مسیر تولید تصویر را به همان Worker اضافه می‌کند. Worker جدید جداگانه نساز.

## Secrets و Variables

Secret لازم و موجود:

- `GEMINI_API_KEY` — کلید Gemini را به‌صورت Secret نگه دار.

Variableهای اختیاری:

- `STAR_AI_CHAT_MODEL` — پیش‌فرض `gemini-2.5-flash`
- `STAR_AI_IMAGE_MODEL` — پیش‌فرض `gemini-3.1-flash-image`
- `STAR_AI_5_BETA_SUCCESS_RATE` — پیش‌فرض `0.2`، یعنی موفقیت ۲۰٪ برای مدل 5.0 Beta
- `TAVILY_API_KEY` — برای Web Search فعلی

در صورت نداشتن متغیر `STAR_AI_IMAGE_MODEL`، نیازی به اضافه‌کردن آن نیست. Worker به‌طور پیش‌فرض از `gemini-3.1-flash-image` استفاده می‌کند.

## تست پس از Deploy

اول آدرس اصلی Worker را در مرورگر باز کن:

`https://star-ai-gemini-api.star-ai-official-2026.workers.dev/`

باید JSON شامل `status: online` ببینی و `imageGeneration` باید `true` باشد.

سپس در خود Star-AI، با مدل 3.0 یا بالاتر یک درخواست تصویر بفرست. درخواست به این مسیر می‌رود:

`POST /api/public/generate-image`

اگر خطا دیدی:

- `404`: نسخه جدید Worker Deploy نشده یا مسیر Worker دیگری را ویرایش کرده‌ای.
- `503` با پیام کلید: Secret با نام دقیق `GEMINI_API_KEY` به Worker فعال متصل نیست.
- `502`: درخواست به Gemini رسیده ولی Gemini خطا داده؛ متن خطا در پاسخ نشان داده می‌شود. نام مدل، دسترسی API و سهمیه را بررسی کن.

## مدل Beta

در هر دو مسیر چت و تصویر، رفتار آزمایشی 5.0 Beta اعمال می‌شود. نرخ پیش‌فرض موفقیت ۲۰٪ است. این رفتار روی نسخه‌های 2.0، 3.0 و 4.0 اعمال نمی‌شود.

## نکات

- کلید Gemini را در کد Frontend، GitHub عمومی یا `VITE_*` قرار نده.
- برای نسخه دسکتاپ و GitHub Pages، هر دو آدرس API از قبل در Workflow پروژه به همین Worker تنظیم شده‌اند.
- چت همچنان از مدل `gemini-2.5-flash` استفاده می‌کند، مگر اینکه `STAR_AI_CHAT_MODEL` را خودت تغییر بدهی.
