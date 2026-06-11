# Sistem Penjadwalan Sekolah — REST API

REST API untuk manajemen jadwal pelajaran sekolah, dibangun dengan **Express.js**, **Prisma ORM**, dan **PostgreSQL** (Supabase).

## Tech Stack

- Node.js + Express.js
- Prisma ORM
- PostgreSQL (Supabase)
- Swagger (swagger-jsdoc + swagger-ui-express)
- Multer (upload file)
- XLSX + ExcelJS (import/export Excel)
- dotenv, uuid, cors

## Instalasi

```bash
# Clone repository
git clone <repo-url>
cd sistem-penjadwalan

# Install dependencies
npm install
```

## Setup Environment

Salin file `.env.example` ke `.env`, lalu sesuaikan:

```bash
cp .env.example .env
```

Isi variabel berikut:

| Variable       | Deskripsi                         | Default      |
| -------------- | --------------------------------- | ------------ |
| `PORT`         | Port server                       | `3000`       |
| `DATABASE_URL` | Connection string PostgreSQL      | —            |
| `API_KEY`      | API Key untuk autentikasi header  | `SECRET123`  |

Contoh `DATABASE_URL` Supabase:

```
postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

## Prisma Migration

```bash
# Generate Prisma Client
npx prisma generate

# Jalankan migration (development)
npx prisma migrate dev --name init

# Atau push schema langsung (tanpa migration history)
npx prisma db push
```

## Menjalankan Project

```bash
# Development (dengan auto-reload)
npm run dev

# Production
npm start
```

Server akan berjalan di `http://localhost:3000` (default).

## Swagger / API Docs

Buka browser di:

```
http://localhost:3000/api-docs
```

Semua endpoint terdokumentasi lengkap di Swagger UI.

## Autentikasi

Semua endpoint `/api/*` memerlukan header:

```
x-api-key: SECRET123
```

## Endpoint API

### CRUD Jadwal

| Method   | Endpoint              | Deskripsi                |
| -------- | --------------------- | ------------------------ |
| `POST`   | `/api/schedules`      | Buat jadwal baru         |
| `GET`    | `/api/schedules`      | Ambil semua jadwal       |
| `GET`    | `/api/schedules/:id`  | Ambil jadwal by ID       |
| `PUT`    | `/api/schedules/:id`  | Update jadwal            |
| `DELETE` | `/api/schedules/:id`  | Hapus jadwal             |

### Upload & Export Excel

| Method | Endpoint                 | Deskripsi                          |
| ------ | ------------------------ | ---------------------------------- |
| `POST` | `/api/schedules/upload`  | Import jadwal dari file Excel      |
| `GET`  | `/api/schedules/export`  | Export jadwal ke file Excel        |

**Export** memerlukan query parameter: `start_date`, `end_date`

### Jadwal Siswa

| Method | Endpoint                | Query Params          |
| ------ | ----------------------- | --------------------- |
| `GET`  | `/api/schedules/student`| `class_code`, `date`  |

### Jadwal Guru

| Method | Endpoint                 | Query Params                          |
| ------ | ------------------------ | ------------------------------------- |
| `GET`  | `/api/schedules/teacher` | `teacher_nik`, `start_date`, `end_date` |

### Rekap JP (Yayasan)

| Method | Endpoint                          | Query Params                |
| ------ | --------------------------------- | --------------------------- |
| `GET`  | `/api/schedules/report/rekap-jp`  | `start_date`, `end_date`    |

## Deteksi Bentrok Jadwal

Saat membuat atau mengupdate jadwal, sistem otomatis mendeteksi **bentrok**:

- **Bentrok Guru**: Guru yang sama tidak bisa mengajar di waktu yang overlap pada tanggal yang sama.
- **Bentrok Kelas**: Kelas yang sama tidak bisa memiliki jadwal overlap pada tanggal yang sama.

Jika bentrok terdeteksi, API mengembalikan **HTTP 409 Conflict**.

## Format File Excel (Import)

File Excel yang di-upload harus memiliki kolom berikut di sheet pertama:

| Kolom          | Tipe    | Contoh          |
| -------------- | ------- | --------------- |
| `class_code`   | String  | X-A             |
| `class_name`   | String  | X-A             |
| `subject_code` | String  | MTK             |
| `teacher_nik`  | String  | 1234567890      |
| `teacher_name` | String  | Budi Santoso    |
| `date`         | Date    | 2025-06-10      |
| `jam_ke`       | Integer | 1               |
| `time_start`   | String  | 07:00           |
| `time_end`     | String  | 07:45           |


## Struktur Project

```
src/
├── app.js                    # Express app setup
├── server.js                 # Server entry point
├── config/
│   └── prisma.js             # Prisma client singleton
├── routes/
│   ├── schedule.routes.js    # CRUD routes
│   ├── student.routes.js     # Student schedule
│   ├── teacher.routes.js     # Teacher schedule
│   ├── report.routes.js      # Rekap JP
│   └── upload.routes.js      # Upload & export Excel
├── controllers/
│   ├── schedule.controller.js
│   ├── student.controller.js
│   ├── teacher.controller.js
│   ├── report.controller.js
│   └── upload.controller.js
├── services/
│   ├── schedule.service.js   # CRUD + conflict detection
│   ├── excel.service.js      # Import/export Excel
│   └── report.service.js     # Report queries
├── middleware/
│   ├── apiKey.middleware.js   # API key validation
│   └── upload.middleware.js   # Multer config
├── swagger/
│   └── swagger.js            # Swagger/OpenAPI config
└── utils/
    ├── excelParser.js        # Parse Excel to data
    └── excelGenerator.js     # Generate Excel file
prisma/
└── schema.prisma             # Database schema
```

