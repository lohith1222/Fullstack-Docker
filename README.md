# CarePoint Medical Camp Manager

The existing Spring Boot CRUD service and the React frontend are organized as
separate sibling projects:

```text
Fullstack-Docker/
├── backend/   # Existing Spring Boot and Maven medical camp API
├── frontend/  # React and Vite application
└── README.md
```

The frontend uses `VITE_API_BASE_URL` to connect to the backend. For local
development, the default is `http://localhost:8081`.

## Run with Docker Compose

Compose starts the frontend and backend containers and connects them on a
private network. The backend uses your existing MySQL database on the host;
Compose does not create, replace, or delete a database container or its data.

1. Copy the root environment template and edit `.env` with the credentials for
   your existing MySQL database and JWT configuration:

   ```powershell
   Copy-Item .env.example .env
   ```

   Replace the example password and secret values. `.env` is ignored by Git.

2. Ensure MySQL is running and accepts connections from Docker. The default
   host is `host.docker.internal`; set `DB_HOST` in `.env` if needed.

3. From the project root, start the application:

   ```powershell
   docker compose up --build -d
   ```

   Open `http://localhost`. The frontend's Nginx server forwards API requests
   to the backend container. The backend is also available at
   `http://localhost:8081`.

4. Stop the application containers with:

   ```powershell
   docker compose down
   ```

The Compose setup does not start MySQL or Eureka. Eureka registration is
disabled only for the standalone backend container.

## Run locally

Start the existing MySQL database and make sure the backend's database settings
in `backend/src/main/resources/application.properties` match your environment.
Provide `JWT_SECRET` if it is required by your existing backend configuration.

In the first terminal, from the project root:

```powershell
Set-Location .\backend
.\mvnw.cmd spring-boot:run
```

In a second terminal:

```powershell
Set-Location .\frontend
Copy-Item .env.example .env
npm install
npm run dev
```

Open the Vite URL printed in the terminal (normally `http://localhost:5173`).
Set `VITE_API_BASE_URL` in `frontend/.env` if the backend uses another address.
The backend CORS configuration allows the default Vite development origins.

## Medical camp API

The frontend uses the existing backend endpoints without renaming them:

| Action | Request |
| --- | --- |
| List camps | `GET /DisplayAll` |
| View a camp | `GET /Display/{id}` |
| Create a camp | `POST /Add` |
| Update a camp | `PUT /Update/{id}` |
| Delete a camp | `DELETE /Delete/{id}` |

The existing record fields are `campName`, `location`, `campDate`,
`doctorCount`, and `id`.
