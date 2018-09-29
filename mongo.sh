docker kill mongo
docker rm mongo
docker run \
	--name mongo \
	-d \
	-p 2701:2701 \
	-e MONGO_INITDB_ROOT_USERNAME=user \
	-e MONGO_INITDB_ROOT_PASSWORD=password \
	mongo:4
