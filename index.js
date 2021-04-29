'use strict';
if (require.main !== module)
    throw 'This utility is meant to be executed directly!';

const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');
const progressBar = new (require('cli-progress').SingleBar)(
    {},
    require('cli-progress').Presets.shades_classic
);

// check that we have args
if (process.argv.length < 3) return console.log('No file specified!');

// upload the file, show progress to user
console.log("Uploading... Progress bar may not be 100% accurate as axios drains streams faster than actual upload 🙃")
progressBar.start(fs.lstatSync(process.argv[2]).size, 0);
let totalUploaded = 0;

let data = new FormData();
data.append(
    'file',
    // use lazy reading to get a sort of progress bar lol
    fs.createReadStream(process.argv[2]).on('data', (chunk) => {
        totalUploaded += chunk.length;
        progressBar.update(totalUploaded);
    }),
    process.argv[2]
);
data.append('maxDownloads', '1');
data.append('autoDelete', 'true');


// send out data
axios
    .post('https://file.io', data, {
        headers: data.getHeaders(),
    })
    .then((res) => {
        progressBar.stop();
        console.log(`\nhttps://file.io/${res.data.key}`);
    })
    .catch((e) => {
        progressBar.stop();
        console.log('\nAn error occured!');
    });
