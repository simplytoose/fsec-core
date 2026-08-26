# ⚡ FlashGear - E-Commerce Platform

FlashGear — це сучасна високопродуктивна платформа електронної комерції (E-Commerce), яка спеціалізується на швидких розпродажах (Flash Sales). Проєкт побудований з використанням мікросервісних патернів, має надійний захист від оверселінгу (overselling) та повністю готовий до production-навантажень.

## 🏗 Архітектура та Технології

### Backend
- **Core:** Java 21, Spring Boot 3.2.x
- **Database:** PostgreSQL 16
- **Cache & Locks:** Redis (через Redisson)
- **Security:** Spring Security + JWT
- **ORM / Migrations:** Spring Data JPA, Hibernate, Flyway
- **Build Tool:** Gradle

### Frontend
- **Core:** React 19, TypeScript, Vite
- **Routing:** React Router v7
- **Styling:** Vanilla CSS з елементами Glassmorphism, Tailwind CSS, Lucide Icons
- **State Management:** React Context API (CartContext, AuthContext)
- **HTTP Client:** Axios

## ✨ Основні Фічі

1. **Захист від оверселінгу (Flash Sale Mechanics):**
   - Використання розподілених блокувань (Distributed Locks) через **Redisson**.
   - Попереднє сортування товарів у кошику для запобігання Deadlocks (взаємного блокування транзакцій).
   - Подвійна валідація наявності товару (в Redis Cache та PostgreSQL).
2. **Ідемпотентність запитів:**
   - Кастомна анотація `@Idempotent` та AOP-аспект для запобігання дублюванню платежів/замовлень під час подвійних кліків (Double-Click Prevention) із збереженням `Idempotency-Key` у Redis.
3. **Автентифікація та Авторизація:**
   - Повноцінна JWT автентифікація.
   - Розділення ролей (`ROLE_USER` та `ROLE_ADMIN`).
4. **Адмін-панель:**
   - Керування замовленнями (зміна статусів від `PENDING` до `DELIVERED`).
   - Керування каталогом товарів.
5. **Оптимізований код:**
   - Всі Data Transfer Objects (DTO) написані з використанням **Java 21 Records**, що позбавляє необхідності використання Lombok.
   - Використання сучасного Stream API (`.toList()`).

## 🚀 Як запустити проєкт локально

### 1. Запуск інфраструктури (Postgres & Redis)
Переконайтеся, що у вас запущений Docker Desktop. Виконайте команду в корені проєкту:
```powershell
docker-compose up -d
```
*Це підніме контейнер PostgreSQL (`flash-sale-postgres`) на порту `5432` та Redis (`flash-sale-redis`) на порту `6379`.*

### 2. Запуск Backend (Spring Boot)
Проєкт використовує вбудований Gradle Wrapper, тому не потребує глобального встановлення Gradle. У корені проєкту виконайте:
```powershell
.\gradlew bootRun
```
*Бекенд запуститься на `http://localhost:8080`. Flyway автоматично застосує всі необхідні міграції до БД.*

### 3. Запуск Frontend (React + Vite)
Відкрийте новий термінал, перейдіть до папки `frontend` та запустіть development-сервер:
```powershell
cd frontend
npm install
npm run dev
```
*Фронтенд буде доступний за посиланням, яке видасть Vite (зазвичай `http://localhost:5173`).*

---

## 🛡️ Тестові акаунти (Адмін)

Для доступу до Адмін-панелі (`/admin`), ви можете створити власний акаунт через форму реєстрації, або використати існуючий (якому вже надано права `ADMIN` безпосередньо в базі даних):

- **Логін:** `admin@qlashgear.com`
- **Пароль:** *(пароль, вказаний при реєстрації цього акаунту)*

## 📦 Міграції Бази Даних (Flyway)
Проєкт використовує Flyway для версіонування структури бази даних. Міграції знаходяться у `src/main/resources/db/migration/`:
- `V1` - Ініціалізація `users`
- `V2`, `V3` - Додавання сутностей `products`, `orders`, `order_items`
- `V4` - Фікси кодування
