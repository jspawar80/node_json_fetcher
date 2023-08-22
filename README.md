# node_json_fetcher
 Tool to fetch, view, and edit remote configuration files from instances.

---

# Config Viewer

Config Viewer is a simple web application that allows users to view and edit configuration files from different instances. It retrieves configuration files through SCP and provides a user-friendly interface for editing and saving changes to the remote server.


## Features

- Fetch configuration files from multiple instances.
- Edit configuration files in a JSON-friendly editor.
- Save edited configurations back to the remote server.

## Tech Stack

- **Frontend**: HTML, Bootstrap, Vanilla JavaScript
- **Backend**: Node.js with Express.js
- **File Transfer**: SCP

Certainly! Here's the section on how to edit the `instances` array in the `main.js` file:

---

## Editing the Instances Array

The `instances` array in the `main.js` file contains the details of the remote servers from which the configuration files are fetched. To add or modify instances, follow these steps:

1. Open the `main.js` file in your preferred code editor.

2. Locate the `instances` array. Each instance is represented as an object with the following properties:

- `name`: A unique identifier for the instance.
- `user`: The username for the remote server.
- `host`: The IP address or hostname of the remote server.
- `port`: The port number for the SCP connection (usually 22 for SSH).
- `privateKey`: The path to the private key file used for authentication.
- `remotePath`: The path to the configuration file on the remote server.

3. To add a new instance, append a new object to the `instances` array:

```javascript
{
    name: 'newInstanceName',
    user: 'username',
    host: 'ip_or_hostname',
    port: 22,
    privateKey: '/path/to/private/key',
    remotePath: '/path/on/remote/server'
}
```

4. To modify an existing instance, locate the corresponding object in the `instances` array and update the desired properties.

5. Save the `main.js` file after making your changes.

6. Restart the server to apply the changes.

---

## Setup & Installation

1. Clone the repository:

2. Install the required dependencies:

```bash
npm install
```

3. Update the `instances` array in `main.js` with the details of the instances you want to connect to.

4. Start the server:

```bash
node main.js
```

5. Open a web browser and navigate to `http://localhost:3000`.

## Usage

1. Select the instance from the dropdown.
2. Click on "Fetch Config" to load the configuration file.
3. Edit the configuration in the provided textarea.
4. Click on "Save Changes" to save the edited configuration back to the remote server.
