# ⚙️ Evaluator Service

The **Evaluator Service** is a core component of the Remote Code Execution platform. It is responsible for securely evaluating user-submitted code using Docker containers, and returning the execution results back to the Submission Service.

---

## 🧩 Responsibilities

- Continuously listens to the **Redis Submission Queue** for new jobs.
- Identifies the programming language of the submission.
- Uses a language-specific **Executor Strategy** to evaluate code.
- Runs the code inside a Docker container with controlled resources.
- Streams execution logs to analyze output, memory usage, and error handling.
- Sends the final execution result to the **Redis Evaluation Queue**.

---

## 🔁 Workflow

1. **Job Pickup**  
   Picks up jobs from the `Redis Submission Queue` where the **Submission Service** has pushed submissions.

2. **Language Detection & Strategy Selection**  
   Based on the `language` field in the job, a corresponding strategy (e.g., `CppExecutor`, `PythonExecutor`, etc.) is selected.

3. **Docker Execution**  
   Using the [`dockerode`](https://www.npmjs.com/package/dockerode) package:
   - The required Docker image is pulled.
   - A container is created and started with the appropriate code execution command.
    
4. **Memory & Timeout Handling**
   - If memory exceeds the limit → container is automatically restricted.
   - Timeout is set (e.g., 2 seconds) to handle TLE (Time Limit Exceeded) scenarios.

5. **Stream-Based Log Capturing**
   - Container logs are captured via a loggerStream in chunks.
   - The buffer is decoded using a utility method to get stdout and stderr.

6. **Output Evaluation**
   - The decoded output is matched against the expected output.
   - Response status is determined as:
     - SUCCESS – Output matches
     - WA - Wrong Answer
     - ERROR - Runtime or Compile Error
     - TLE - Timit Limit Exceeded
      
7. **Response Dispatch**
   - After evaluation, the result is sent to the Redis Evaluation Queue.
   - The Submission Service consumes this to update submission status in DB.

8. **Bull Board Ui**
   - UI page to view the status of the Jobs in Redis Queue. (/ui)
  
     ![image](https://github.com/user-attachments/assets/1670ce55-2dc7-43fe-8684-055dd57f90e6)

  
## ✨ Running Locally

### 🧱  Prerequisites

- Node.js (v16+)

- Redis Connection

### 📦 Installation
1. Clone the Repository
   ```
   git clone <repo-url>
   cd evaluator-service
   ```
2. Install dependencies
   ```
   npm install
   ```
3. Setup .env file
4. Run the Service
    ```
    npm run dev 
    ```
5. Verify the service
     ```
     http://localhost:8080/ping
     ```
6. Bull Board UI
   ```
   http://localhost:8080/ui
   ```

# 🚀 Future Enhancements

- Remove Dockerode Dependency
- Support for More Languages
- Multi-Queue Load Balancing
- Queue Prioritization for Premium Users
- Testing & Validation (Unit Tests, Component Tests, Load Testing with K6)
- Branching Strategy for CI/CD (Develop, Release, Cherry-pick Bug Fixes)
- CI/CD Integration and Deployment




