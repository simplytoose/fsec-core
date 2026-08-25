# Flash Sale Core

Цей документ містить детальний підсумок виконаних робіт, опис виявлених проблем під час запуску проєкту **Flash Sale Core** та шляхи їх вирішення.

---

## 1. Проблеми та їх вирішення

### 1.1. Високе навантаження оперативної пам'яті (RAM 92%) через Docker / WSL2
* **Симптом / Причина**: 
  У Windows Docker Desktop використовує підсистему **WSL2** (`vmmem`). За замовчуванням WSL2 може динамічно захоплювати від 50% до 80% усієї оперативної пам'яті комп'ютера і не віддавати її назад. Також процес Docker Desktop перебував у стані *Paused*.
* **Вирішення**:
  1. Знято Docker Desktop із паузи та запущено контейнер PostgreSQL.
  2. Для запобігання переповненню RAM у майбутньому рекомендовано створити файл `%USERPROFILE%\.wslconfig` з обмеженням оперативної пам'яті:
     ```ini
     [wsl2]
     memory=2GB
     processors=2
     ```
     і виконати перезапуск підсистеми у PowerShell: `wsl --shutdown`.

---

### 1.2. Відсутність у проєкті Gradle Wrapper (`gradlew.bat`)
* **Симптом / Причина**: 
  При спробі виконання `gradle bootRun` або `.\gradlew bootRun` виникала помилка `CommandNotFoundException` / `The term 'gradle' is not recognized`. В системі не було встановлено глобальний Gradle, а в самому проєкті були відсутні файли wrapper'а.
* **Вирішення**:
  Автоматично завантажено дистрибутив Gradle 8.5 та виконано генерацію локального Gradle Wrapper (`gradle wrapper`). У корінь проєкту додано файли:
  - `gradlew`
  - `gradlew.bat`
  - `gradle/wrapper/gradle-wrapper.properties`
  - `gradle/wrapper/gradle-wrapper.jar`
  
  Це дозволило запускати проєкт командою `.\gradlew bootRun` без встановлення будь-яких додаткових програм чи пакетних менеджерів.

---

### 1.3. Помилка компіляції Flyway залежності (`Could not find org.flywaydb:flyway-database-postgresql:`)
* **Симптом / Причина**: 
  При компіляції виникала помилка:
  > `Could not find org.flywaydb:flyway-database-postgresql:.`
  У файлі `build.gradle` було вказано `implementation 'org.flywaydb:flyway-database-postgresql'` без вказання версії. Оскільки Spring Boot 3.2.4 поставляється з Flyway 9.x (де підтримка PostgreSQL вбудована безпосередньо у `flyway-core`), окремий модуль `flyway-database-postgresql` був відсутній у BOM та не мав версії.
* **Вирішення**:
  У файлі [`build.gradle`](file:///c:/Users/simplytoose/Documents/Projects/2344523/build.gradle) вилучено некерований рядок `org.flywaydb:flyway-database-postgresql`, залишивши стандартний `org.flywaydb:flyway-core`. Компіляція прошла успішно.

---

### 1.4. Конфлікт порту 8080 (`Web server failed to start. Port 8080 was already in use`)
* **Симптом / Причина**: 
  При повторному запуску `.\gradlew bootRun` у консолі додаток не зміг стартувати, оскільки порт `8080` вже було зайнято попереднім фоновим процесом тестування.
* **Вирішення**:
  Фоновий процес було завершено, порт `8080` звільнено.

---

## 2. Результат запуску проєкту

1. **База даних**: Контейнер `flash-sale-postgres` (`postgres:16-alpine`) успішно піднято у Docker на порту `5432`.
2. **Міграції**: Flyway 9.22.3 підключився до БД `flash_sale_db` та успішно застосував міграцію `V1__init_schema.sql`.
3. **Сервер**: Вбудований Tomcat веб-сервер успішно запущений на порту `8080`.
4. **Статус додатка**: Spring Boot додаток повністю ініціалізовано та готово до прийому HTTP-запитів (`http://localhost:8080`).

---

## 3. Як запускати проєкт надалі

Для запуску проєкту у майбутньому достатньо двох кроків у терміналі:

1. Перевірити, що Docker включений, і підняти базу даних:
   ```powershell
   docker-compose up -d
   ```
2. Запустити Spring Boot додаток:
   ```powershell
   .\gradlew bootRun
   ```
