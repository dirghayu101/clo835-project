# Cleaning up the system for existing resources:
- kubectl get pods -n kube-system
- kubectl get ns
- minikube stop
- minikube delete
- minikube start
- Or, kubectl delete --all pods,svc,deployments,replicasets --all-namespaces

# To get metrics:
- minikube addons enable metrics-server
- kubectl get pods -n kube-system
- kubectl top pods #After enabling metrics-server through above command you can use this.

# To check allocated minikube resources:
- kubectl describe node minikube
- minikube profile list # Doesn't work much.


# To check if kubectl has been configured correctly:
- Check context of kubectl: 
    kubectl config current-context

- Get detailed information about cluster kubectl is connected to:
    kubectl cluster-info

- Ensure minikube node is there recognized by kubectl:
    kubectl get nodes

- Check if you can reach kubernetes API server:
    kubectl get componentstatuses


# Setup:
- Full stack namespace creation for the project:
    kubectl create namespace fullstack-app

# Step 1:
- Create a Dockerfile for the Nginx server that serves static files:
    - Created static directory and simple HTML, CSS and JS page.
    - Create a Dockerfile outside the static directory. 
    - Build the docker image and test it in the local environment: 
        docker build -t my-nginx-static .
        docker run -d -p 8080:80 --name my-nginx-server my-nginx-static
    - Test it.
    - Clean docker environment:
        docker system prune -a      # Cache clearing and other functionalities.
        docker ps -a # -> List Containers.
        docker rmi clo835-assignment-2 # -> Remove image 
        docker rm -f <container_id_or_name> # -> Stops and remove container at the same time.
        docker rm -f $(docker ps -a -q)         # -> DO NOT USE.
        docker rmi -f $(docker images -q)       # -> DO NOT USE.
    - Push the image to the docker hub.
        docker tag my-nginx-static dirghayu101/nginx-static
        docker push dirghayu101/nginx-static

# Step 2: Backend (Node.js) and Database (MongoDB) Setup:
    - Create a Node.js API server that connects to MongoDB.
        - mkdir mongo-node-api
        - cd mongo-node-api
        - npm init -y
        - npm install express mongoose dotenv

Create a Dockerfile to containerize the Node.js application.
Use environment variables to configure the MongoDB connection string.
Build and push the Docker image to Docker Hub.
Database (MongoDB):
Use the official MongoDB image from Docker Hub.
Configure MongoDB to use a persistent volume for data storage.



