## Backend with Frontend 2048 MVP (Backend)  

### Description  
this is the backend of backend-with-frontend for MVP version of 2048 game. implemented with fastapi with http interface.  
  
With frontend-backend design it is assumed that game state are persisted and compute, updated on server side. Potentially capable of supporting realtime multiplayer competition(preferably in socket implementation), persisted score board, game history, user perferences etc.  

### Design/Comments/Remarks  
- With hexagonal architecture and DDD it decouple domain and infra layer and allows easy update for technologies.  

- the game service are implemented as http endpoints, while its straight forward, socket would be a more preferable interface given the nature of long living and frequent updates nature and potentially communicate with other players. the http overhead would soon be the main bottleneck.  

### Features  
- 2048 game basics  
- game state persistenece to custom destination  

### Install  
- `pip install -r requirements.txt`  

### Testing  
- `pytest`  

### Development  
- modify cors as needed at `./app/main.py`  
- `python -m venv venv` (first-run-only)  
- activate venv - `venv\Scripts\activate` (Windows)  
- activate venv - `source venv/bin/activate` (Linux)  
- `fastapi dev app/main.py`  
- swagger: http://127.0.0.1:8000/docs  
- redoc: http://127.0.0.1:8000/redoc  

### Deploy(GCP)  
- `gcloud run deploy backend-api --source . --region asia-southeast1 --allow-unauthenticated --set-env-vars APP_ENV=production`  

### Live demo  
- https://backend-api-549124287752.asia-southeast1.run.app
- https://dedd-app-2.web.app/  
