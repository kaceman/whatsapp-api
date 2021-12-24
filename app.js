const express = require('express')
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const app = express()
const port = 3000

const SESSION_FILE_PATH = './session.json';

// Load the session data if it has been previously saved
let sessionData;
if(fs.existsSync(SESSION_FILE_PATH)) {
    sessionData = require(SESSION_FILE_PATH);
}

// Use the saved values
const client = new Client({
    session: sessionData
});

// Save session values to the file upon successful auth
client.on('authenticated', (session) => {
    sessionData = session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
        if (err) {
            console.error(err);
        }
    });
});

app.use(express.json());

app.listen(port, () => {
  console.log(`listening at port ${port}`)
})

client.on('qr', (qr) => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Whatsapp is ready!');

    app.post('/whatsapp/api/send', (req, res) => {
        try {
            const phone = req.body.phone;
            const message = req.body.message;
            client.sendMessage(phone.substring(1) + '@c.us', message);
        } catch(e) {
            res.json({success: false, message: 'Message not sent'});
        }
        res.json({success: true, message: 'Message sent'});
    })
});

client.initialize();