  const express = require('express');
  const path = require('path');
  const { exec } = require('child_process');
  const fs = require('fs');

  const app = express();
  const PORT = 3000;
  app.use(express.text()); 

  // Mapping of instance names to their details
  const instances = [
    {
      name: 'jay1',
      user: 'root',
      host: '143.110.190.57',
      port: 911,
      privateKey: '/home/ishu/balpreet.pem',
      remotePath: '/root/config.json'
    },
    {
      name: 'jay2',
      user: 'root',
      host: '143.110.190.57',
      port: 911,
      privateKey: '/home/ishu/balpreet.pem',
      remotePath: '/root/config.json'
      // ... other details
    },
  ];

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });

  app.get('/get-instances', (req, res) => {
    const instanceNames = instances.map(instance => ({ name: instance.name }));
    res.json(instanceNames);
  });

  app.get('/config/:instanceName', (req, res) => {
    const instanceName = req.params.instanceName;
    const instanceDetails = instances.find(instance => instance.name === instanceName);

    if (!instanceDetails) {
      return res.status(404).send('Instance not found');
    }

    const scpCommand = `scp -P ${instanceDetails.port} -i ${instanceDetails.privateKey} ${instanceDetails.user}@${instanceDetails.host}:${instanceDetails.remotePath} /tmp/config.json`;

    exec(scpCommand, (error, stdout, stderr) => {
      if (error) {
        console.error('Error fetching config:', error);
        return res.status(500).send('Error fetching config');
      }
      res.sendFile('/tmp/config.json');
    });
  });


  app.post('/save-config/:instanceName', (req, res) => {
    const instanceName = req.params.instanceName;
    
    // Find the instance details from the array
    const instanceDetails = instances.find(instance => instance.name === instanceName);

    if (!instanceDetails) {
        return res.status(404).send('Instance not found');
    }

    // Save the edited content to a temporary file
    const tempFilePath = '/tmp/edited_config.json';
    fs.writeFileSync(tempFilePath, req.body);

    // Use scp to send the edited file to the remote server
    const scpCommand = `scp -P ${instanceDetails.port} -i ${instanceDetails.privateKey} ${tempFilePath} ${instanceDetails.user}@${instanceDetails.host}:${instanceDetails.remotePath}`;

    exec(scpCommand, (error, stdout, stderr) => {
        if (error) {
            console.error('Error saving config:', error);
            return res.status(500).send('Error saving config');
        }
        res.status(200).send('Config saved successfully');
    });
  });



  app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
  });
