# PayPilot 

> **Hakaton Layihəsi (Hackathon Project)**: Bu layihə xüsusi olaraq bir Hakaton çərçivəsində **MVP (Minimum İşlək Məhsul)** kimi qısa müddət ərzində hazırlanmışdır. Dərhal istifadəyə yararlı olacaq real texnoloji həll yollarının konseptual nümayişidir.

**PayPilot** (və ya *CardAssistant*), xüsusilə Azərbaycan bazarı üçün dizayn edilmiş, qabaqcıl süni intellekt (AI) dəstəkli mobil bankçılıq və şəxsi maliyyə köməkçisi tətbiqidir. React Native (Expo) və Supabase texnologiyaları əsasında qurulan tətbiq, təbii dildə verilən səsli və yazılı əmrləri anlayaraq (Google Gemini 2.5 Flash vasitəsilə) istifadəçiyə ən sərfəli ödəniş yollarını (məsələn, ən yüksək cashback verən bankı) təşviq edir.

---

## Komanda və Yaradıcılar (Contributors)

* **Omar Musazada** (*Mobile & Frontend Development*) - Multiplatform React Native (Expo) mobil tətbiqinin kodlanması, UI/UX interfeyslərinin ekranlaşdırılması və daxili "state" idarəetməsi.
* **Sanan Hajiyev** (*Backend & Database Engineering*) - Supabase (PostgreSQL) məlumat bazasının arxitekturası, RLS (Row Level Security) təhlükəsizliyi və SQL RPC (process_payment) vasitəsilə atomik tranzaksiya məntiqinin yazılması.
* **Farrukh Mammadli** (*Designer & AI / Prompt Engineering*) - Gemini 2.5 Flash modelinin Edge Functions ilə inteqrasiyası, səsli/yazılı əmrləri analiz edən xüsusi AI "System Prompt"unun (cashback tövsiyələri daxil) tərtibi və ümumi dizayn konsepti.
* **Rauf Jafarov** (*DevOps & Cloud Architecture*) - Layihənin "Serverless" bulud infrastrukturunun (Edge Functions) qurulması, məxfi mühit açarlarının (.env) təhlükəsiz izolyasiyası və server bağlantılarının konfiqurasiyası.
* **Ibrahim Mammadov** (*Project Manager*) - Layihənin mərhələli inkişaf (Agile) prosesinə rəhbərlik, komanda daxili vəzifələrin (taskların) koordinasiyası və son məhsulun vizyon tələblərinin idarə edilməsi.

---

## Əsas Funksiyalar və İnterfeys

### Süni İntellekt Köməkçisi (AI Assistant)

**AI Assistant** ekranı tətbiqin ən əsas moduludur. Siz sadəcə *"Bakcell-ə 15 manat vur"* və ya *"CinemaPlus üçün bilet al"* deyərək səsli/yazılı əmr verirsiniz. Köməkçi arxa planda Azərbaycan banklarının kampaniyalarını xatırlayaraq (məs: Kapital Bank ilə filmlərə 10% cashback var), sizə ən gəlirli kartı təklif edir. Təsdiqinizlə ödəniş anında reallaşır və uöurla başa çatdığını ekranda yuxarıdakı kimi göstərir.

### Rəqəmsal Cüzdan (My Wallet)

Bütün virtual və fiziki bank kartlarınızı tək səhifədən idarə edin! Bu ekranda (My Wallet) kartlarınız nömrələri, balansları və bəzəkli dizaynları ilə siyahılanır. Məsələn: ABB, Kapital Bank, Leobank kimi fərqli kartlarınızı əlavə edib, onları "Favorit" seçə və aktiv qalıq balansı anında vizual olaraq izləyə bilərsiniz.

### Xərclərin İdarəedilməsi və Təhlil (Insights)

**Insights** paneli yalnız xərclərinizi yox, eləcə də qazandıqlarınızı göstərən müasir görünüşlü bir qrafik ekranıdır. Həftəlik və aylıq xərcləmələr sütunlarla vizuallaşdırılır, hansı günlər daha çox xərc çəkdiyiniz aşkar olunur. Eləcə də "Bonuses & Offers" hissəsində Bravo, Wolt kimi yerlərdə düzgün kart seçdiyiniz üçün nə qədər qənaət etdiyiniz (Cashback/Bonuslar) konkret rəqəmlərlə nümayiş etdirilir.

### Təhlükəsiz Ödəniş və Təsdiqləmə (Secure Payments / OTP)

Ödənişin son addımında pullarınızın tam təhlükəsizliyi üçun qorunan **OTP ekranı** qarşınıza çıxır. "Verified by Visa" və Mərkəzi Bankın təhlükəsizlik qaydalarına bənzər şəkildə formalaşdırılmış interfeys ilə sizə gələn 4 rəqəmli kodu daxil edərək pulunuzun başqa mənbələrə getmə riskini sıfıra endirirsiniz. Bütün maliyyə əməliyyatları **Supabase RPC** vasitəsilə atomik formada saxlanılır.

---

## Texnologiya Steki (Tech Stack)

| Səviyyə | Texnologiya | Özəllik / Məqsəd |
|---------|-------------|------------------|
| **Frontend** | React Native, Expo, TypeScript | Çarpaz platforma (iOS/Android), mürəkkəb animasiyalar |
| **Backend** | Supabase (PostgreSQL) | Məlumat bazası, Auth, SQL Row Level Security (RLS) |
| **Süni İntellekt** | Deno (Edge Functions) + Gemini 2.5 Flash | Mürəkkəb dil təhlili, səsli mesajların və arxa fon ssenarilərinin emalı |
| **Styling** | React Native StyleSheet / Lucide Icons | Premium, modern və dinamik interfeyslərin yaradılması |

## Layihənin Strukturu

```text
PayPilot/
├── assets/            # GitHub Təqdimatı üçün media faylları və şəkillər
├── backend/           # Məlumat bazasının infrastrukturu
│   └── supabase/
│       ├── migrations/    # Baza cədvəlləri (cards, transactions) və backend funksiyaları
│       └── functions/
│           └── ai-chat/   # Gemini AI API - Edge Function skriptləri
│
├── frontend/          # Mobil tətbiqin (Expo) kod bazası
│   ├── src/
│   │   ├── components/    # Təkrar istifadə edilə bilən UI düymələri, kartlar və s.
│   │   ├── screens/       # Tətbiqin əsas görünüşləri (Home, Chat, Wallet)
│   │   ├── services/      # AI və Verilənlər bazası inteqrasiyaları
│   │   └── context/       # Auth və Sistem state-lərinin idarəsi
│   ├── App.tsx          
│   └── package.json       
│
└── README.md          # Bu məlumatlandırma faylı
```

## Quraşdırma və İşəsalma

### 1. Backend-in Quraşdırılması (Supabase)
1. [supabase.com](https://supabase.com) platformasında profil hesabınıza uyğun yeni layihə yaradın.
2. **SQL Editor** bölməsinə keçin və layihədəki `backend/supabase/migrations/001_initial_schema.sql` skriptini icra edin.
3. Supabase idarəetmə panelinizdən *URL* və *Anon Key* deyilən iki açarı köçürün və `frontend/.env` faylını yaradıb içinə yapışdırın.
4. **Gemini AI** istifadəsi üçün isə: Supabase Dashboard ➔ Edge Functions ➔ Secrets bölməsinə daxil olub `GEMINI_API_KEY` adıyla yeni gizli açar əlavə edin.

### 2. Frontend-in Quraşdırılması (React Native / Expo)
Aşağıdakı lokal əmrləri icra edərək layihəni ayağa qaldırın:

```bash
cd frontend
npm install
npx expo start
```
*Qeyd: Daha dərin detallar üçün `frontend/README.md` və `backend/README.md` fayllarını oxuya bilərsiniz.*

---

## 📄 Lisenziya (License)
Bu layihə tamamilə açıq mənbəli (open-source) olaraq **MIT Lisenziyası** altında qorunur. Daha ətraflı məlumat üçün ana qovluqdakı [LICENSE](./LICENSE) faylına baxa bilərsiniz.
