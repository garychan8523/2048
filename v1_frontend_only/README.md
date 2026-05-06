## Frontend-Only 2048 MVP  

### Description  
this is a frontend only MVP version of 2048 game. implemented with vite with react.  
  
With frontend only design it is assumed that user can play offline once connected with minimal game respond lantency. While all logic are exposed to users and running on user device, game state can be interfered.  

### Design/Comments/Remarks  
- for AI suggestion,  
    - Just for curiousity, I also tried with local web-llm and attempt to generate move suggestion. it was not included in the result as the performance was not satisfying. SmolLM2-135M-Instruct-q0f32-MLC model was unable to produce meaningful result while Llama-3.2-1B-Instruct-q4f16_1-MLC model improves with few-shots prompting still not useful enough for effective move suggestion.  
    https://github.com/mlc-ai/web-llm/issues/683  

    - from my point of view i dont think language model fits for the purpose as its more of an optimization problem rather than semantics which usually solve with heuristics if no deterministic solution exists(yet).  

    - I choose the expectimax algorithm as its a more generally accepted effective approach for generating suggested move. the code was converted from https://github.com/lesaun/2048-expectimax-ai/blob/master/ai.py with help of gpt with minor adjustment for prioritizing on immediate win cases.  

    - Just for fun I have added start/pause auto play function to auto perform suggestion move  
- test cases and part of the features were generated with gpt with review  

### Features  
- 2048 game basics  
- local storage persistence after each move  
- responsive design capatible with mobile devices  
- start/pause auto perform suggesion move  

### Testing  
- `npm test`  
- tests cover core game logic functions including grid operations, move calculations and game state management  

### Install  
- `npm install`  

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
- https://dedd-app.web.app/  
