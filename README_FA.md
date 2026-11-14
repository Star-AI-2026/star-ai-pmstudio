# اصلاح Liquid Glass برای Star-AI

## فایل‌های تغییرکرده
- `src/styles.css`
- `src/components/star/SettingsDialog.tsx`
- `src/components/star/Sidebar.tsx`

## تغییرات
- افکت دکمه‌ها به شیشه دودیِ نیمه‌شفاف با Blur و اشباع رنگ بیشتر تغییر کرد.
- نور سفید شدید، ترکیب Screen و حاشیه سفید پرنور حذف یا کم شد.
- دکمه‌های Settings، Help و Account در پایین Sidebar از افکت شیشه‌ای مستثنا شدند.
- لایه تاریک‌کننده تنظیمات به عنصر جداگانه پشت پنجره منتقل شد.
- انیمیشن پنجره تنظیمات فقط با Transform اجرا می‌شود؛ روی والد و پنل شیشه‌ای opacity/filter انیمیت نمی‌شود تا backdrop-filter بتواند صفحه پشت خود را درست محو کند.
- فایل `public/version.json` تغییر نکرده است.

## اعمال
سه فایل را در مسیرهای بالا جایگزین کن. فایل `.env` و Secretها را حفظ کن.
سپس Commit و Push کن و پس از Deploy صفحه را با `Ctrl+Shift+R` تازه‌سازی کن.
