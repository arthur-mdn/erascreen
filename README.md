# Getting Started with Erascreen
A webapp to display an interactive screen. Associate a new screen and control it in real-time via websockets.
Made with React + Vite and Node.js + MongoDB + Socket.io.

## Installation
```bash
git clone https://github.com/arthur-mdn/erascreen.git
cd erascreen
```
### Install the server dependencies
```bash
cd server
npm install
```
> ⚠️ You will need to duplicate the `.env.example` file to `.env` and update the environment variables.

> ⚠️ You will also need to create a MongoDB database and update the `DB_URI` variable in the server .env file.

### Install the client dependencies
```bash
cd client
npm install
```
> ⚠️ You will need to duplicate the `.env.example` file in to `.env` and update the environment variables.
> 
### Install the admin dependencies
```bash
cd admin
npm install
```
> ⚠️ You will need to duplicate the `.env.example` file in to `.env` and update the environment variables.

## Execution

### Launch the server script
In the server directory, you can run this to run the server.

```bash
cd server
node server.js
```
### Launch the client script
In the client directory, you can run this to run the app in development mode :
```bash
cd client
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

### Launch the admin script
In the admin directory, you can run this to run the app in development mode :
```bash
cd admin
npm run dev
```
Open [http://localhost:5174](http://localhost:5174) to view it in your browser.
