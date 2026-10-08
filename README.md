# Research Opportunity Portal

A full-stack web application designed for university faculty and students to publish, discover, and manage academic research positions. Built with FastAPI, SQLAlchemy, MySQL, and Vanilla HTML/CSS/JavaScript following RESTful design principles.

---

## Project Overview

The **Research Opportunity Portal** provides a centralized platform for university departments to advertise undergraduate and graduate research openings. Students can view available positions, check faculty requirements, and monitor application deadlines. Faculty members can create new listings, edit project scopes, close filled positions, and remove outdated postings.

---

## Features

- **Full CRUD Functionality**: Complete lifecycle management for research opportunities (Create, Read, Update, Delete).
- **Status State Transitions**: Switch opportunities from `Open` to `Closed` when positions are filled.
- **RESTful API**: Standardized JSON request and response models powered by FastAPI and Pydantic v2.
- **Input Validation**: Server-side and client-side validation enforcing non-empty fields, positive position counts, valid deadlines, and enum status constraints.
- **Error Handling**: Distinct HTTP status responses (`200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`, `500 Internal Server Error`).
- **Dynamic Frontend**: Modern single-page interface using Vanilla JavaScript (`fetch`) without hardcoded listings or heavy framework dependencies.
- **Real-Time Search & Filtering**: Client-side filtering by status (`Open` / `Closed` / `All`) and multi-field text search.
- **Postman Test Suite**: Preconfigured test collection verifying all CRUD operations and error status assertions.

---

## Technologies Used

| Component | Technology | Description |
|---|---|---|
| **Backend Framework** | Python 3.10+, FastAPI | High-performance asynchronous REST API framework |
| **ORM & Database Driver** | SQLAlchemy 2.x, PyMySQL | Object-relational mapping and MySQL communication |
| **Data Validation** | Pydantic v2 | Request/response data models and type enforcement |
| **Database** | MySQL 8.x | Relational storage for persistent opportunity records |
| **ASGI Server** | Uvicorn | Lightning-fast ASGI server for running FastAPI |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript | Responsive single-page interface consuming REST endpoints |
| **API Testing** | Postman v2.1 | Automated API test assertions and variable chaining |

---

## Project Structure

```
CN_Project_Assignment/
├── backend/
│   ├── app/
│   │   ├── __init__.py          # Python package initializer
│   │   ├── main.py              # FastAPI app instance, CORS & exception handlers
│   │   ├── config.py            # Environment configuration loader
│   │   ├── database.py          # SQLAlchemy engine, session maker & get_db dependency
│   │   ├── models.py            # Opportunity database model mapping
│   │   ├── schemas.py           # Pydantic request/response validation schemas
│   │   ├── crud.py              # Database query operations
│   │   └── routers/
│   │       ├── __init__.py      # Routers package initializer
│   │       └── opportunities.py # Opportunity REST API route handlers
│   ├── requirements.txt         # Python package dependencies
│   └── .env.example             # Backend environment template
├── frontend/
│   ├── index.html               # Main user interface layout
│   ├── style.css                # Academic portal stylesheet
│   └── app.js                   # REST API client, DOM rendering & validation logic
├── database/
│   └── schema.sql               # MySQL table creation and sample seed dataset
├── postman/
│   ├── research_portal.postman_collection.json # 10-step Postman testing suite
│   └── sample_opportunities.json               # Realistic sample dataset
├── .env.example                 # Root environment template
├── .gitignore                   # Git version control ignore rules
└── README.md                    # Project documentation & setup instructions
```

---

## Prerequisites

Ensure you have the following installed locally:
- **Python**: Version 3.10 or higher (`python3 --version`)
- **pip**: Python package manager (`pip --version`)
- **MySQL Server**: Version 8.0 or higher (`mysql --version`)
- **Web Browser**: Modern browser (Chrome, Firefox, Safari, Edge)
- **Postman**: (Optional) For automated API testing

---

## MySQL Database Setup

1. Start your local MySQL service:
   ```bash
   # macOS (Homebrew)
   brew services start mysql

   # Linux (systemd)
   sudo systemctl start mysql

   # Windows
   net start MySQL80
   ```

2. Execute the schema file to create the `research_portal` database, the `opportunities` table, and initial seed records:
   ```bash
   mysql -u root -p < database/schema.sql
   ```

   *(Alternatively, open `database/schema.sql` in MySQL Workbench or phpMyAdmin and execute all queries.)*

---

## Environment Variables

Copy the provided `.env.example` template into `.env`:

```bash
cp .env.example backend/.env
```

Open `backend/.env` and update the values with your MySQL server configuration:

```env
# Server Configuration
HOST=127.0.0.1
PORT=8000

# MySQL Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=research_portal
```

> **Note**: Do not commit the `.env` file to version control. It is ignored by `.gitignore`.

---

## Backend Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python3 -m venv venv
   ```

3. Activate the virtual environment:
   - **macOS / Linux**:
     ```bash
     source venv/bin/activate
     ```
   - **Windows**:
     ```bash
     venv\Scripts\activate
     ```

4. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

---

## Backend Running Instructions

With your virtual environment activated and MySQL running:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Once running, access the interactive API documentation:
- **Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- **Health Check**: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

---

## Frontend Running Instructions

In a separate terminal window, serve the frontend files using Python's built-in HTTP server:

```bash
cd frontend
python3 -m http.server 3000
```

Open your browser and navigate to:
```
http://127.0.0.1:3000
```

The frontend will load and connect directly to the FastAPI server at `http://127.0.0.1:8000/api/opportunities`.

---

## API Endpoints

| Method | Endpoint | Description | Request Body | Response Status |
|---|---|---|---|---|
| `POST` | `/api/opportunities` | Create a new research opportunity | JSON (`OpportunityCreate`) | `201 Created` / `400 Bad Request` |
| `GET` | `/api/opportunities` | List all research opportunities | None | `200 OK` |
| `GET` | `/api/opportunities/{id}` | Retrieve details of one opportunity | None | `200 OK` / `404 Not Found` |
| `PUT` | `/api/opportunities/{id}` | Update an existing opportunity | JSON (`OpportunityUpdate`) | `200 OK` / `400 Bad Request` / `404 Not Found` |
| `DELETE` | `/api/opportunities/{id}` | Delete a research opportunity | None | `200 OK` / `404 Not Found` |

### Opportunity JSON Schema

```json
{
  "title": "Autonomous Drone Swarm Coordination in GPS-Denied Tunnels",
  "description": "Investigating distributed consensus algorithms and visual-inertial SLAM for autonomous UAV swarms operating in subterranean environments.",
  "research_area": "Robotics & Autonomous Systems",
  "faculty_name": "Dr. Sarah Chen",
  "department": "Computer Science & Engineering",
  "required_skills": "ROS2, C++, Python, OpenCV, Linear Algebra",
  "available_positions": 3,
  "application_deadline": "2026-11-30",
  "status": "Open"
}
```

---

## Postman Testing

A complete 10-step Postman collection is located at `postman/research_portal.postman_collection.json`.

### How to Run:
1. Open **Postman**.
2. Click **Import** and select `postman/research_portal.postman_collection.json`.
3. Verify the collection variable `base_url` is set to `http://localhost:8000`.
4. Click **Run Collection** to execute the tests in sequence:
   1. `1. Create Research Opportunity #1` (`POST 201`)
   2. `2. Create Research Opportunity #2` (`POST 201`)
   3. `3. Create Research Opportunity #3` (`POST 201`)
   4. `4. Retrieve All Opportunities` (`GET 200`)
   5. `5. Retrieve One Opportunity by ID` (`GET 200`)
   6. `6. Update an Opportunity` (`PUT 200`)
   7. `7. Change Opportunity from Open to Closed` (`PUT 200`)
   8. `8. Delete an Opportunity` (`DELETE 200`)
   9. `9. Request Deleted Opportunity (Expect 404)` (`GET 404`)
   10. `10. Send Invalid/Missing Data (Expect 400)` (`POST 400`)

---

## Expected HTTP Status Codes

- **`200 OK`**: Returned for successful `GET`, `PUT`, and `DELETE` requests.
- **`201 Created`**: Returned upon successful creation of a new opportunity via `POST`.
- **`400 Bad Request`**: Returned when request body fails validation (e.g., negative positions, blank fields, invalid date, or unrecognized status).
- **`404 Not Found`**: Returned when the requested opportunity `id` does not exist in the database.
- **`500 Internal Server Error`**: Returned if an unexpected database or server crash occurs.

---

## Screenshots section

*(Add your application screenshots below prior to final submission)*

| Opportunities Listing | Create / Edit Form Modal |
|---|---|
| ![Opportunities Listing](docs/screenshots/listing.png) | ![Create Opportunity Modal](docs/screenshots/create_modal.png) |

| Opportunity Detail View | Postman Test Results |
|---|---|
| ![Opportunity Details](docs/screenshots/details.png) | ![Postman Test Suite](docs/screenshots/postman_results.png) |

---

## Demo Video section

> **Important**: Per assignment instructions (Section 7 & 9), the demonstration video **must not exceed one minute**.

- **Video Walkthrough Link**: [Watch Project Demo Video](https://youtu.be/your-demo-video-link)
- **Local Recording**: `docs/demo/research_portal_walkthrough.mp4`

The 60-second video demonstrates:
1. Backend server & database running.
2. Frontend application running.
3. Creating a research opportunity through UI.
4. Retrieving and displaying stored opportunities.
5. Updating an opportunity.
6. Closing an opportunity (Open → Closed).
7. Deleting an opportunity.
8. Triggering validation error and 404 Not Found error.
9. Postman execution results.

---

## GitHub Repository section

- **Repository URL**: `https://github.com/<your-username>/research-opportunity-portal`
- **Branch**: `main`
- **License**: MIT License

---

## Submission Archive

Per Section 8 of the assignment, compress the project into:
```
P24_0000_NAME_CLASS.zip
```
Ensure the ZIP contains:
- Complete backend and frontend source code
- Database setup/schema (`database/schema.sql`)
- Exported Postman collection (`postman/research_portal.postman_collection.json`)
- `README.md` with setup instructions & GitHub URL
- One-minute demonstration video or link
