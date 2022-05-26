dockerBuilPush(){
    docker build -t $1:$2 .;
    docker push $1:$2
}
dockerPullRun(){
    docker pull $1:$2;
    docker run -d --network host $1:$2
}

dockerBuilPush_web(){
    dockerBuilPush tranthientoan102/labellingwebapp $1
}
dockerPullRun_web(){
    dockerPullRun tranthientoan102/labellingwebapp $1
}

dockerBuilPush_scrapper(){
    dockerBuilPush tranthientoan102/scrapperdocker $1
}
dockerPullRun_scrapper(){
    dockerPullRun tranthientoan102/scrapperdocker $1
}