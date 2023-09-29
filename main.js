const express = require('express');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = 3000;
app.use(express.text());

const instances = [
    {
        name: 'jay1',
        user: 'root',
        host: '143.110.000.10',
        port: 22,
        privateKey: '/home/ishu/key.pem',
        paths: ['/usr/src/app/.env']
    },
];

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/get-instances', (req, res) => {
    const instanceNames = instances.map(instance => ({ name: instance.name }));
    res.json(instanceNames);
});

app.get('/containers/:instanceName', (req, res) => {
    const instanceName = req.params.instanceName;
    const instanceDetails = instances.find(instance => instance.name === instanceName);

    if (!instanceDetails) {
        return res.status(404).send('Instance not found');
    }

    const sshCommand = `ssh -p ${instanceDetails.port} -i ${instanceDetails.privateKey} ${instanceDetails.user}@${instanceDetails.host} "docker ps --format '{{.ID}} {{.Image}}'"`;

    exec(sshCommand, (error, stdout, stderr) => {
        if (error) {
            console.error('Error fetching containers:', error);
            return res.status(500).send('Error fetching containers');
        }

        const containers = stdout.trim().split('\n').map(line => {
            const parts = line.split(' ');
            return {
                containerId: parts[0],
                imageName: parts.slice(1).join(' ')
            };
        });

        res.json(containers);
    });
});

app.get('/config/:instanceName/:containerId', (req, res) => {
    const { instanceName, containerId } = req.params;
    const instanceDetails = instances.find(instance => instance.name === instanceName);

    if (!instanceDetails) {
        return res.status(404).send('Instance not found');
    }

    let envData = '';
    let errors = [];

    // Function to execute the sshCommand for each path
    function fetchEnvForPath(index) {
        if (index >= instanceDetails.paths.length) {
            if (errors.length) {
                console.error('Errors fetching env:', errors);
                return res.status(500).send('Error fetching env');
            }
            return res.send(envData);
        }

        const sshCommand = `ssh -p ${instanceDetails.port} -i ${instanceDetails.privateKey} ${instanceDetails.user}@${instanceDetails.host} "docker exec ${containerId} cat ${instanceDetails.paths[index]}"`;

        exec(sshCommand, (error, stdout, stderr) => {
            if (error) {
                errors.push(error);
            } else {
                envData += stdout + '\n';
            }
            fetchEnvForPath(index + 1);  // Recursive call with incremented index
        });
    }

    fetchEnvForPath(0);  // Start the recursive function with the first path
});

app.post('/save-config/:instanceName/:containerId', (req, res) => {
    const { instanceName, containerId } = req.params;
    const instanceDetails = instances.find(instance => instance.name === instanceName);

    if (!instanceDetails) {
        return res.status(404).send('Instance not found');
    }

    const envContent = req.body;
    const envPath = instanceDetails.paths[0];  // Assuming you're saving to the first path in the array
    const updateEnvCommand = `ssh -p ${instanceDetails.port} -i ${instanceDetails.privateKey} ${instanceDetails.user}@${instanceDetails.host} "docker exec -i ${containerId} sh -c 'cat > ${envPath}'" <<EOF\n${envContent}\nEOF`;

    exec(updateEnvCommand, (error, stdout, stderr) => {
        if (error) {
            console.error('Error updating env:', error);
            return res.status(500).send('Error updating env');
        }

        // Restart the container after updating the .env file
        const restartCommand = `ssh -p ${instanceDetails.port} -i ${instanceDetails.privateKey} ${instanceDetails.user}@${instanceDetails.host} "docker restart ${containerId}"`;

        exec(restartCommand, (restartError, restartStdout, restartStderr) => {
            if (restartError) {
                console.error('Error restarting container:', restartError);
                return res.status(500).send('Error restarting container');
            }
            res.status(200).send('Env updated and container restarted successfully');
        });
    });
});


app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
