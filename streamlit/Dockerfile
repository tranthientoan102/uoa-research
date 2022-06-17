# Image from dockerhub
FROM python:3.8.1

ENV PYTHONUNBUFFERED 1
# Expose the port 8000 in which our application runs
EXPOSE 8000
# Make /app as a working directory in the container
WORKDIR /app/src
# Copy requirements from host, to docker container in /app
#COPY ./config/chromedriver .


COPY requirements.txt /app/src
RUN pip install -r requirements.txt
#RUN pip install -r requirements.txt

# Copy everything from ./src directory to /app in the container
# COPY ./src .
COPY ./ .
RUN mkdir models

ENV tweetBerTopic_clean=1ZAdPdUsj7t45EoL7SBMoPkio5WtXtki1
RUN gdown $tweetBerTopic_clean -O ./models/tweetBerTopic_clean


ENV tweetBerTopic_raw=13pIz-56nVijvUqKj0bAILpxjSgCyzSNZ
RUN gdown $tweetBerTopic_raw -O ./models/tweetBerTopic_raw

RUN python afterSetup.py

# Run the application in the port 8000
# uvicorn --host 0.0.0.0 --port 8000 fast:app --reload
CMD ["streamlit", "run", "test.py", "--server.port", "9999"]
#CMD ["uvicorn", "fast:app"]
