# راهنمای اتصال تصویر Star-AI به Cloudflare Worker

## نکته مهم

کلید Gemini در Cloudflare Worker تنظیم شده است؛ بنابراین برنامه نباید برای ساخت تصویر به Lovable یا OpenAI درخواست بفرستد. در نسخه اصلاح‌شده، هر دو مسیر چت و تصویر به همین Worker می‌روند:

`https://star-ai-gemini-api.star-ai-official-2026.workers.dev`

مسیرهای موردنیاز Worker:

- `POST /api/public/chat`
- `POST /api/public/generate-image`
- `OPTIONS` برای هر دو مسیر، جهت CORS preflight

## چه چیزی در این ZIP تغییر کرده؟

- `VITE_STAR_AI_IMAGE_API_BASE` در Workflow انتشار GitHub Pages به همان Cloudflare Worker تنظیم شده است.
- اسکریپت Build نسخه دسکتاپ نیز به‌صورت پیش‌فرض از همان Worker استفاده می‌کند.
- پیام 404 اکنون توضیح می‌دهد که مسیر تصویر باید در Cloudflare Worker اضافه شود.
- کلید Gemini در هیچ متغیر Frontend یا فایل `.env` قرار داده نشده است.

## افزودن مسیر تصویر به Worker فعلی

این پروژه سورس اصلی Worker موجود در حساب Cloudflare را در اختیار ندارد؛ بنابراین نمی‌توانم بدون دیدن کد آن، منطق چت فعلی را جایگزین کنم. فایل `cloudflare-worker/generate-image-handler.js` یک Handler مستقل آماده است. آن را به پروژه Worker اضافه کن و طبق راهنمای `cloudflare-worker/IMAGE_GENERATION_ROUTE_FA.md` در Router فعلی فراخوانی کن.

در Cloudflare Worker، کلید موجود را به‌صورت Secret Binding در یکی از نام‌های زیر در دسترس قرار بده:

- `GEMINI_API_KEY`
- `GOOGLE_GEMINI_API_KEY`
- `GOOGLE_API_KEY`

در صورت استفاده از نام دیگری، فقط نام Binding را در Handler تغییر بده. کلید را در GitHub Actions، `VITE_*` یا Frontend قرار نده.

## تست بعد از Deploy

1. از DevTools مرورگر، درخواست `POST` به `/api/public/generate-image` را بررسی کن.
2. پاسخ موفق باید JSON با ساختار `image.dataUrl`، `image.fileName` و `image.mimeType` داشته باشد.
3. پاسخ 404 یعنی Router هنوز مسیر را به Handler متصل نکرده است.
4. پاسخ 503 یعنی Secret در Worker در دسترس نیست.
5. پاسخ 502 معمولاً یعنی درخواست Gemini رد شده یا مدل/دسترسی تصویر مشکل دارد؛ متن خطای برگشتی را بررسی کن.
