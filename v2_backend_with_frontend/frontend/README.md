## Backend with Frontend 2048 MVP (Frontend)  

### Description  
this is the frontend of backend-with-frontend for MVP version of 2048 game. implemented with vite with react.  
  
the code base was mostly converted from `v1_frontend_only` with help of gpt, just to demostrate the alternative where game logic is hosted on server of different tech stack.  

### Design/Comments/Remarks  
- refer to `v1_frontend_only`  

### Features  
- refer to `v1_frontend_only`  

### Install  
- `npm install`  

### Testing  
- `npm test`  
- tests cover core game logic functions including grid operations, move calculations and game state management  

### Development  
- modify cors as needed at `./vite.config.ts`  
- `npm run dev`  

### Deploy (Firebase)  
- `npm install -g firebase-tools` (first-run-only)  
- `npm run build`  
- `firebase login`  
- `firebase init`  (first-run-only)  
- `firebase deploy`  

### Live demo  
- https://dedd-app-2.web.app/  
