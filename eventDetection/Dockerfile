# Image from dockerhub
FROM python:3.8.1-slim

ENV PYTHONUNBUFFERED 1
# Expose the port 8000 in which our application runs
EXPOSE 8002
# Make /app as a working directory in the container
WORKDIR /app/src
# Copy requirements from host, to docker container in /app
#COPY ./config/chromedriver .

# Copy everything from ./src directory to /app in the container
# COPY ./src .
COPY requirements.txt /app/src
#RUN --mount=type=cache,target=/root/.cache/pip pip install -r requirements.txt
RUN pip install -r requirements.txt

COPY ./ .

ENV modelID=1cP2DMfSFbDSwUm3YGMTQOh6C535vGL2w
RUN mkdir models
RUN gdown --id $modelID -O ./models/ed_best_model_state.bin

# Run the application in the port 8002
# uvicorn --host 0.0.0.0 --port 8002 fast_ed2:app --reload
CMD ["uvicorn", "--host", "0.0.0.0", "--port", "8002", "fast_ed2:app"]
#CMD ["uvicorn", "fast:app"]