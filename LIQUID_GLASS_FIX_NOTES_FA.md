# یادداشت اصلاح Liquid Glass

این Patch بر اساس پروژه ارسال‌شده ساخته شده است.

## فایل‌های تغییرکرده
- `src/components/star/Sidebar.tsx`
- `src/components/star/SettingsDialog.tsx`
- `src/styles.css`

## تغییرات
1. دکمه‌های Settings، Help و Account در پایین Sidebar با `data-liquid-glass-exempt="true"` از افکت کپسولی New Glass مستثنا شدند.
2. افکت Liquid Glass کپسولی iOS-inspired برای سایر دکمه‌های معمولی فقط در حالت New فعال است؛ کنترل‌های `role="switch"` مستثنا هستند.
3. لایه تیره‌کننده Settings به عنصر جداگانه‌ای تبدیل شد که sibling پنل شیشه‌ای است، نه ancestor آن.
4. انیمیشن لایه تمام‌صفحه حذف شد؛ انیمیشن scrim جدا و انیمیشن پنل فقط با transform انجام می‌شود تا نمونه‌برداری backdrop-filter مختل نشود.
5. پنل تنظیمات کمی رنگ تم تیره دارد و blur واقعی پشت آن را نمایش می‌دهد تا نوشته‌های صفحه چت به‌صورت واضح روی محتوای تنظیمات تکرار نشوند.

`public/version.json` در این Patch تغییر نکرده است.
