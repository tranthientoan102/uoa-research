# Image from dockerhub
FROM python:3.8.1-slim

ENV PYTHONUNBUFFERED 1
# Expose the port 8000 in which our application runs
EXPOSE 8001
# Make /app as a working directory in the container
WORKDIR /app/src
# Copy requirements from host, to docker container in /app
#COPY ./config/chromedriver .

# Copy everything from ./src directory to /app in the container
# COPY ./src .
COPY requirements.txt /app/src
RUN pip install -r requirements.txt
#RUN --mount=type=cache,target=/root/.cache/pip pip install -r requirements.txt

COPY . .

ENV modelID=1cumVQw4c8FbnZIQO2pW1yF_GBM9e4v3n
RUN mkdir models
RUN gdown --id $modelID -O ./models/sa_best_model_state.bin

# Run the application in the port 8000
# uvicorn --host 0.0.0.0 --port 8001 fast_sa2:app --reload
CMD ["uvicorn", "--host", "0.0.0.0", "--port", "8001", "fast_sa2:app"]
#CMD ["uvicorn", "fast:app"]