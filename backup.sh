#!/bin/bash

# valid script params: [ backup | restore ]

if [ -z "$1" ]
then
  echo "script needs to be called with params [ backup | restore ]"
  exit
else
	if [ "$1" != "backup" ]; then
		if [ "$1" != "restore" ]; then
		  echo "script needs to be called with params [ backup | restore ]"
		  exit
		fi
	fi
fi

TYPE_OPERATION="db-$1"
echo "type operation: $TYPE_OPERATION"

container_name=$(docker-compose config --services | grep db)

backup(){

	if [ -z "$container_name" ]
	then
	  echo "\$container_name is empty"
	else
	  if [ "$( docker container inspect -f '{{.State.Running}}' $container_name )" == "true" ]; then
	  	echo "container $container_name running. Proceeding to stop..."
			docker-compose stop $container_name
			echo "$container_name stopped"
	  fi
	fi

  echo "$TYPE_OPERATION-ing..."
  docker-compose -f docker-compose.yml -f docker-compose.backup.restore.yml run --rm $TYPE_OPERATION
  echo "$TYPE_OPERATION-ed"

	docker-compose start $container_name
	echo "done"
}

backup
# # execute a script called external.sh
# source ./external.sh