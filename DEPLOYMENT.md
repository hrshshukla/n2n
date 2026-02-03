# Node 2 Node Deployment Guide

## Deployment Options

### Option 1: Local Network Deployment

The simplest deployment for a n2n application is to run it on a computer within your local network.

1. Build the application:

   ```bash
   mvn clean package
   cd ui && npm run build && cd ..
   ```

2. Run the backend:

   ```bash
   java -jar target/n2n-1.0-SNAPSHOT.jar
   ```

3. Run the frontend (production mode):

   ```bash
   cd ui && npm start
   ```

4. Access the application at `http://localhost:3000`
5. Share your local IP address with others on the same network to access the application

### Option 2: Docker Deployment

Docker makes it easy to package and deploy both components. We've already created the necessary files for you:

- `Dockerfile.backend` - Docker configuration for the Java backend
- `Dockerfile.frontend` - Docker configuration for the Next.js frontend
- `docker-compose.yml` - Docker Compose configuration to run both services

To deploy with Docker:

1. Make sure Docker and Docker Compose are installed on your system
2. Run with Docker Compose:
   ```bash
   docker-compose up -d
   ```

This will build and start both the backend and frontend services. The frontend will be available at http://localhost:3000 and the backend at http://localhost:8080.

### Option 4: Virtual Private Server (VPS)

For complete control, deploy to a VPS like DigitalOcean, Linode, or AWS EC2. We've created helper files to make this process easier:

- `vps-setup.sh` - A script that automates the setup process on Ubuntu/Debian VPS
- `nginx.conf.example` - A sample Nginx configuration with HTTPS and security headers

#### Automated Setup

1. SSH into your server
2. Upload the project files to your server
3. Make the setup script executable and run it:
   ```bash
   chmod +x vps-setup.sh
   ./vps-setup.sh
   ```

#### Manual Setup


   ```bash
   mvn clean package
   cd ui && npm install && npm run build
   ```

1. Use a process manager like PM2:

   ```bash
   # For the backend
      #(1) Direct start :
      cd ~/n2n
      pm2 start java --name n2n-backend --cwd /home/ubuntu/n2n/target -- -jar n2n-1.0-SNAPSHOT-shaded.jar

      #(2) Pull from github and Restart :
      cd ~/n2n
      git pull origin main
      mvn clean package
      pm2 restart n2n-backend

   # For the frontend
      #(1) Direct start :
      cd ~/n2n/ui
      npm run build
      pm2 start npm --name n2n-frontend -- start

      #(2) Pull from github and Restart :
      cd ~/n2n/ui
      git pull origin main
      npm install      # agar new dependency aayi ho toh
      npm run build

      pm2 restart n2n-frontend
   ```

2. Set up Nginx as a reverse proxy using the provided `nginx.conf.example` as a template:
   
   ```bash
   sudo cp nginx.conf.example /etc/nginx/sites-available/n2n
   sudo ln -sf /etc/nginx/sites-available/n2n /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```



1. Set up SSL with Let's Encrypt:
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```


### Pull Changes 

### ✅ **Frontend (UI) update ka correct process**

#### (1) get inside n2n or n2n/ui and 

```bash
cd ~/n2n   OR    cd ~/n2n/ui
git pull 
```

##### (2) install packages 

```bash
npm install
```


##### (3) **MANDATORY BUILD**

```bash
npm run build
```


##### (4) Frontend ko PM2 se **production mode** me restart start karo

```bash
pm2 restart n2n-frontend 
```



---

### If any error 

##### (2) Purana build & node_modules nuke karo

```bash
rm -rf .next node_modules package-lock.json
```

---

##### (3) Fresh install

```bash
npm install
```

Verify:

```bash
ls node_modules/.bin/next
```

##### (4) **MANDATORY BUILD**

```bash
npm run build
```

⚠️ Ye step skip kiya = PM2 error guaranteed

---

##### (5) Frontend ko PM2 se **production mode** me start karo

```bash
pm2 start npm --name n2n-frontend -- start
```

---

##### (6) Check

```bash
pm2 list
```

✅ Expected:

```
n2n-backend   online
n2n-frontend  online
```

---

##### (7) Save (VERY IMPORTANT)

```bash
pm2 save
```

#### ✅ **Backend (Server) update ka correct process**

##### (1) n2n folder ke andar jao & latest code pull karo

```bash
cd ~/n2n
git pull
```

---

##### (2) Backend ko rebuild karo (**MANDATORY**)

```bash
mvn clean package
```

👉 Isse **latest shaded JAR** banega:

```
target/n2n-1.0-SNAPSHOT-shaded.jar
```

---

##### (3) Backend ko PM2 se restart karo

```bash
pm2 restart n2n-backend
```

---

##### (4) Check status

```bash
pm2 list
```

✅ Expected:

```
n2n-backend   online
n2n-frontend  online
```

---

##### (5) Logs check (agar doubt ho)

```bash
pm2 logs n2n-backend --lines 20
```

---

##### (6) Save (VERY IMPORTANT)

```bash
pm2 save
```

---

---

### ❌ If any error (Backend fix flow)

#### (1) Backend process hatao

```bash
pm2 delete n2n-backend
```

---

#### (2) Purana build clean karo

```bash
cd ~/n2n
mvn clean
```

(Optional but safe)

```bash
rm -rf target
```

---

#### (3) Fresh build

```bash
mvn clean package
```

---

#### (4) Backend ko PM2 se **fresh start** karo

```bash
pm2 start java --name n2n-backend --cwd target -- -jar n2n-1.0-SNAPSHOT-shaded.jar
```

---

#### (5) Check

```bash
pm2 list
```

---

#### (6) Save (VERY IMPORTANT)

```bash
pm2 save
```
