# Image Viewer

## Install on Raspberry Pi

### PostgreSQL

### Redis

```
sudo apt-get install redis-server
```

### Install Image Viewer

git clone https://github.com/fabianginterreiter/image-viewer/...

```
npm install
```

### Using in Cluster with PM2

npm install pm2 --global

pm2 start bin/www -i 0 --name "viewer"

