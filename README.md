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
   - Container logs are captured via a loggerStream in chunks.
   - The buffer is decoded using a utility method to get stdout and stderr.
