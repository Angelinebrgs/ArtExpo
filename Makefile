.PHONY: créer une image docker
cree_image:
	docker build -f ./docker/dockerfile -t node_install:latest .