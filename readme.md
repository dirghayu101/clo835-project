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

    - Create a Dockerfile to containerize the Node.js application.
    - Use environment variables to configure the MongoDB connection string.
    - Build and push the Docker image to Docker Hub.
        - docker build -t dirghayu101/mongo-node-api .
        - docker push dirghayu101/mongo-node-api

# Step3: Database Setup (MongoDB):
    - Create persistent volumes (k8s/1-persistent-volume-setup/): Set up persistent storage for the MongoDB database using Persistent Volumes (PV) and Persistent Volume Claims (PVC).
        - kubectl apply -f persistent-volume.yml
        - kubectl apply -f persistent-volume-claim.yml

    - Creating mongo username and password using base64 as that's the input requirement (k8s/2-configmaps-secrets/):
        - echo -n "djoshi" | base64
        - echo -n "your-password" | base64
    
    - Setting up configuration (k8s/2-configmaps-secrets/): Create ConfigMaps for managing environment variables like the MongoDB connection string, Node.js application settings, and Nginx configuration. Create Kubernetes Secrets to securely manage sensitive data, such as MongoDB credentials.
        - kubectl apply -f configmap.yml
        - kubectl apply -f secret.yml

    - Setup (k8s/3-mongo-setup): Use the official MongoDB image from Docker Hub. Configure MongoDB to use a persistent volume for data storage. Write a deployment manifest for MongoDB that uses the Persistent Volume and ConfigMap. Expose MongoDB using a ClusterIP service.
        - kubectl apply -f mongo-deployment.yml 
        - kubectl apply -f mongo-service.yml        

# Step 4: Deploy Node.js Backend:
    - Setup (k8s/4-node-api-deployment): Write a deployment manifest for the Node.js API server. Use a ConfigMap to manage environment variables (e.g., MongoDB URI, server port). Expose the backend using a ClusterIP service.
        - kubectl apply -f node-api-deployment.yml
        - kubectl apply -f node-api-service.yml


# Step 5: Nginx deployment:
    - Setup (k8s/5-nginx): Write a deployment manifest for Nginx. Use ConfigMaps to configure Nginx, if necessary. Expose Nginx using a NodePort service.
        - kubectl apply -f nginx-deployment.yml
        - kubectl apply -f nginx-service.yml
    - Exposing nginx in the localhost:
        - minikube service nginx --url

# Step 6: Verifying deployment and other helpful commands:
- kubectl get deployments
- kubectl get services
- minikube logs
- kubectl get pods -o wide
- kubectl logs <pod-name>
- kubectl describe pod <pod-name>
- kubectl delete pod <pod-name>


# Step 7: Application Management:
- Scaling: Scale the Node.js and Nginx deployments to handle more traffic using kubectl scale.
    # Get current configuration.
    - kubectl get deployments
    # Specifying scaling configuration.
    - kubectl scale deployment node-api --replicas=2
    - kubectl scale deployment nginx --replicas=2
    # Checks status of deployed resources.
    - kubectl rollout status deployment node-api
    - kubectl rollout status deployment nginx

- Monitoring: Use kubectl logs to monitor the logs of each container. Describe and inspect resources to ensure everything is running smoothly.
    - kubectl logs <pod-name>
    - kubectl describe pod <pod-name>
    - kubectl get pods -o wide
    - minikube addons enable metrics-server  
    - kubectl top pods # Enabled via minikube.
    
- Port Forwarding: Use kubectl port-forward to access the MongoDB service locally for debugging.
    - kubectl port-forward mongo-76d8bb5 27017:27017  

- Interacting with MongoDB: Connect to MongoDB using the Mongo shell to insert, retrieve, and manage data.
    - brew install mongodb-community-shell
    - mongo mongodb://localhost:27017

- Rolling Updates: Perform rolling updates on the Node.js and Nginx deployments to simulate application updates with zero downtime.
    - kubectl rollout undo deployment/node-api

# Demonstrate:
- Using node port to access nginx frontend.
- Backend interacts with mongodb.
- Data persistence verification. Delete and re-initialize mongo.
- Verify that environment variables are correctly passed from ConfigMaps to the containers.
    - kubectl exec -it mongo-76d8bb58fc-tzv8k   -- env | grep MONGO
    - kubectl exec -it node-api-749b4df577-x8gpg -- env | grep MONGO
- Load testing to see system's behavior.

# Issues Faced:
- 1-> I copied a docker file which used node version 14 and one of the mongodb dependency used an operator which was only available in node version 15+, so I had to update my image.
This command helped me in updating that after I updated the docker image by rebuilding it. Overall the issue was resolved using:
    # rebuild the docker image.
    - docker build -t dirghayu101/mongo-node-api .
    - docker push dirghayu101/mongo-node-api
    # update context.
    - kubectl set image deployment/node-api node-api=dirghayu101/mongo-node-api:latest

- 2-> I was facing an issue with connecting mongodb shell. I tried to figure it out coming up with all worst case possibilities but later realized the issue arose because of improper formatting of connection string.
This command helped me to grab all the values supplied using secret in k8s:
    - kubectl exec -it mongo-76d8bb58fc-nvnll  -- env | grep MONGO
    - mongo "mongodb://djoshi:dG4H93Rn%20lk7qw@localhost:27017"         # Actual connection string.

- 3-> Didn't see that there was going to be an interaction between nginx, node and mongo. Had to modify the code accordingly after each one was already deployed independently.
    - kubectl set image deployment/nginx nginx=dirghayu101/nginx-static:latest
    - Changed the Mongo URI Connection string. That was causing a lot of problem. Finally found the correct format through Gemini and a stackoverflow hint.
    Ref: https://stackoverflow.com/questions/58117292/how-to-properly-deploy-mongodb-on-kubernetes-and-access-it-from-another-pod-jo/58118505#58118505