const express = require('express');
const router = express.Router();
const { sendEmail } = require('../services/emailService');

router.get('/test-email', async (req, res, next) => {
    try {
        await sendEmail({
            to: 'luckyvokta@gmail.com',
            subject: 'Capstone Test Email',
            html: "<h1>Hello from Capstone</h1> <p>What u doin'?</p> <p>This is the 3rd test email</p>"
        })

        res.json({ message: 'Email has been sent' })
    } catch(err) {
        next(err)
    }
})

module.exports = router;