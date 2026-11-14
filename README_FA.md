# اصلاح Liquid Glass برای New version

این Patch فقط دو فایل را تغییر می‌دهد:
- `src/styles.css`
- `src/components/star/SettingsDialog.tsx`

علت خاکستری‌شدن شیشه، لایه‌ی تیره‌ی `bg-black/60 backdrop-blur-sm` پشت پنجره تنظیمات بود. در حالت New، این لایه اکنون به `bg-black/5` تبدیل می‌شود و محوشدن به خود سطح شیشه منتقل می‌شود.

فایل `public/version.json` داخل این Patch نیست و نباید تغییر کند.

نحوه اعمال: دو فایل را دقیقاً در مسیرهای فوق جایگزین کنید، Build بگیرید و Deploy کنید. حالت Old بدون تغییر باقی می‌ماند.
