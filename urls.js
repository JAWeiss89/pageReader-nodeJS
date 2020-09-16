const fs = require("fs");
const envVariables = process.argv
const urls = envVariables[2];

const axios = require("axios");


fs.readFile(urls, "utf8", async function(err, data) {
    if (err) {
        // Exit script completely if error encountered while reading file
        console.log("ERROR! Could not read file with URLs.")
        process.exit(1);
    } else {
        // Make an array of the urls
        let urlsArr = await data.split("\n");
        // First we try to make parallel requests to all URLs in file to keep run time low.
        try {
            let responses = await readUrls(urlsArr);
            for (let i=0; i< responses.length; i++) {
                let domain = urlsArr[i].split("/")[2];

                await fs.writeFile(`${domain}.txt`, responses[i].data, "utf8", (err) => {
                    if (err) {
                        console.log("Error Writing File");
                    } else {
                        console.log(`Wrote to ${domain}.txt`)
                    }
                })
            }
        
        } catch (err) {
            // If error is encountered when making parallel requests, then we instead call them one by one
            for (let url of urlsArr) {
                let domain = url.split("/")[2]; // Will get domain nanme assuming url has fomat of http://<domain name>/routes or https://<domain name>/routes
                let res = await readUrl(url) 
                if (res) { // if res is not null ...
                    await fs.writeFile(`${domain}.txt`, res,"utf8", function(err) {
                        if(err) {
                            console.log("ERROR! Could not write to file.");
                            process.exit(1);
                        }
                        console.log(`Wrote to ${domain}.txt`)
                    })
                } else { // if res is null ...
                    console.log(`Couldn't download ${url}`)
                }
            }
        }
    }
})



// Able to handle multiple parallel promises
async function readUrls(urls) {
    // console.log("========== readUrls was called for ALL urls ==========")
    let promises = [];
    for (let url of urls) {
        if (url != "" || url != "\n") { promises.push(axios.get(url)) }
    }
    let responses = await Promise.all(promises);
    return responses
}

// makes call to one url
async function readUrl(url) {
    if (url == "" || url == "\n") {
        return null;
    }
    try {
        // console.log("=========== readUrl was called for ONE url ===========")
        let res = await axios.get(url);
        return res.data;
    } catch {
        return null
    }
}