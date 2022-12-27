const fetch = require('node-fetch');
const { faker } = require('@faker-js/faker');
const ba64 = require("ba64");
const { convertFile } = require('convert-svg-to-png');
const cheerio = require('cheerio');
const chalk = require('chalk');
const moment = require('moment');
const readlineSync = require('readline-sync');
const delay = require('delay');
const { createWorker } = require('tesseract.js');

const worker = createWorker({
    //   logger: m => console.log(m)
});


// const trained_data = 'eng+hin'
const ReadText = (imgfile, oem, psm) => {

    const oem_var = oem || 2
    const psm_var = psm || 3

    try {
        return new Promise((resolve, reject) => {

            worker.load().then(() => {
                worker.loadLanguage('eng+osd').then(() => {
                    worker.initialize('eng+osd').then(() => {
                        worker.setParameters({
                            tessedit_ocr_engine_mode: oem_var,
                            tessedit_pageseg_mode: psm_var,
                            // tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
                        }).then(() => {
                            worker.recognize(imgfile, {
                                // tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
                            }).then(({ data: { text } }) => {
                                // console.log(text)
                                resolve(text)
                            }).finally(() => {
                                // worker.terminate()
                            })
                        })
                    });
                })
            })

        });

    }
    catch (e) {
        return `An error occurred: ${e}`
    }
}


const randstr = length =>
    new Promise((resolve, reject) => {
        var text = "";
        var possible =
            "abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";

        for (var i = 0; i < length; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        resolve(text);
    });


const generateIndoName = () => {
    const randomName = faker.name.findName().toLowerCase();
    const random1 = faker.word.adjective().toLowerCase();
    const random2 = faker.word.adverb().toLowerCase();
    return {
        result: [
            {
                firstname: random2.replace(/\s/g, ""),
                lastname: randomName.replace(/\s/g, "")
            }
        ]
    }
};

const getCaptcha = () => new Promise((resolve, reject) => {

    fetch('https://api.gaganode.com/api/captcha', {
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'id-ID,id;q=0.9',
            'Connection': 'keep-alive',
            'Origin': 'https://dashboard.gaganode.com',
            'Referer': 'https://dashboard.gaganode.com/',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-site',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
            'sec-ch-ua': '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"'
        }
    })
        .then(res => res.json())
        .then(res => resolve(res))
        .catch(err => reject(err))
});

const sendVcode = (email) => new Promise((resolve, reject) => {

    fetch('https://api.gaganode.com/api/user/email_vcode', {
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'id-ID,id;q=0.9',
            'Connection': 'keep-alive',
            'Content-Type': 'application/json',
            'Origin': 'https://dashboard.gaganode.com',
            'Referer': 'https://dashboard.gaganode.com/',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-site',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
            'sec-ch-ua': '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"'
        },
        body: JSON.stringify({
            'email': email,
            'user_type': 'node',
            'user_tag': 'node'
        })
    })
        .then(res => res.json())
        .then(res => resolve(res))
        .catch(err => reject(err))
});

const register = (email, ref, vcode, captchaId, captcha) => new Promise((resolve, reject) => {
    fetch('https://api.gaganode.com/api/user/register', {
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'id-ID,id;q=0.9',
            'Connection': 'keep-alive',
            'Content-Type': 'application/json',
            'Origin': 'https://dashboard.gaganode.com',
            'Referer': 'https://dashboard.gaganode.com/',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-site',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
            'sec-ch-ua': '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"'
        },
        body: JSON.stringify({
            'email': email,
            'password': 'war1234565',
            'vcode': vcode,
            'captcha_id': captchaId,
            'captcha': captcha.toString(),
            'user_type': 'node',
            'user_tag': 'node',
            'reference_key': ref
        })
    })
        .then(res => res.json())
        .then(res => resolve(res))
        .catch(err => reject(err))
});


const functionGetLink = (email, domain) => new Promise((resolve, reject) => {
    fetch(`https://generator.email/${domain}/${email}`, {
        method: "get",
        headers: {
            accept:
                "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
            "accept-encoding": "gzip, deflate, br",
            cookie: `_ga=GA1.2.659238676.1567004853; _gid=GA1.2.273162863.1569757277; embx=%5B%22${email}%40${domain}%22%2C%22hcycl%40nongzaa.tk%22%5D; _gat=1; io=io=tIcarRGNgwqgtn40O${randstr(3)}; surl=${domain}%2F${email}`,
            "upgrade-insecure-requests": 1,
            "user-agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36"
        }
    })
        .then(res => res.text())
        .then(text => {
            const $ = cheerio.load(text);
            const src = $("#email-table > div.e7m.row.list-group-item > div.e7m.col-md-12.ma1 > div.e7m.mess_bodiyy.plain > p").text();
            resolve(src);
        })
        .catch(err => reject(err));
});

const readCaptcha = () => new Promise((resolve, reject) => {
    ReadText('./captcha.png').then(text => {
        resolve(text)
    }).catch(err => {
        reject(err)
    })
});



(async () => {

    const ref = readlineSync.question('Masukan reff mu : ');

    let fromStart = false;

    process.on('SIGINT', function() {
        worker.terminate();
        process.exit();  
    });

    while (true) {
        try {
            console.log('')
            console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.green(`==========================================`));
            const domain = 'rontgateprop.com';
            const indoName = await generateIndoName();
            const { result } = indoName;
            const name = result[0].firstname.toLowerCase().replace(/[^a-zA-Z0-9]/g, ''); + result[0].lastname.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');;
            const email = `${name}@${domain}`;

            console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.green(`Mendaftarkan email : ${email}`));


            const getCaptchaResult = await getCaptcha();

            if (getCaptchaResult.meta_status !== 1) {
                console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.yellow(`Gagal mendapatkan captcha, mencoba dari awal.`));
                console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.green(`==========================================`));
                continue;
            }

            const captchaId = getCaptchaResult.id;
            console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.yellow(`Proccessing Captcha....`));
            console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.green(`captchaId : ${captchaId}`));
            ba64.writeImageSync("captcha", getCaptchaResult.content);
            await convertFile('./captcha.svg+xml');
            
            const captchaText = await readCaptcha();
            const valueResult = eval(captchaText.split(' ').join(''))
            console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.green(`captcha value : ${valueResult}`));
            console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.green(`Sending vCode....`));
            const sendVcodeResult = await sendVcode(email);

            if (sendVcodeResult.meta_status !== 1) {
                console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.yellow(`Gagal mengirim vCode, mencoba dari awal.`));
                console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.green(`==========================================`));
                continue;
            }

            console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.green(`Getting vCode...`));

            let linkConfirm;
            do {
                linkConfirm = await functionGetLink(name, email.split('@')[1]);
            } while (!linkConfirm);


            const vCode = linkConfirm.split('[')[1].split(']')[0].trim()
            console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.green(`vCode : ${vCode}`));
            const registerResult = await register(email, ref, vCode, captchaId, valueResult);
            if (registerResult.meta_status !== 1) {
                console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.red(`Gagal Register, mencoba dari awal!`));
                console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.green(`==========================================`));
                continue;
            }
            console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.green(`Berhasil didaftarkan!`));
            console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.green(`==========================================`));
            console.log('')
            console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.cyan(`Menunggu 10 Detik`));
            await delay(10000);
        }catch(e){
            console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.red(`Ada masalah serius!, mencoba dari awal!`));
            console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.red(`==========================================`));
            continue;
        }

        
    }

    






})();