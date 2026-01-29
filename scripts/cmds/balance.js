const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

const cacheDir = path.join(__dirname, 'cache');

const COLORS = {
    background: ['#040907', '#081a12', '#040907'],
    accent: '#2ecc71',
    accentLight: '#55efc4',
    white: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.6)',
    glass: 'rgba(255, 255, 255, 0.05)'
};

const CURRENCY_SYMBOL = "$";

// Advanced Large Number Formatter
function formatMoney(amount) {
    const lookup = [
        { value: 1e303, symbol: "Ct" },   // Centillion
        { value: 1e100, symbol: "Googol" }, 
        { value: 1e93, symbol: "Tg" },    
        { value: 1e90, symbol: "NVg" },   
        { value: 1e87, symbol: "OVg" },   
        { value: 1e84, symbol: "SVg" },   
        { value: 1e81, symbol: "SxVg" },  
        { value: 1e78, symbol: "QVg" },   
        { value: 1e75, symbol: "QaVg" },  
        { value: 1e72, symbol: "TVg" },   
        { value: 1e69, symbol: "DVg" },   
        { value: 1e66, symbol: "UVg" },   
        { value: 1e63, symbol: "V" },     
        { value: 1e60, symbol: "ND" },    
        { value: 1e57, symbol: "OD" },    
        { value: 1e54, symbol: "SD" },    
        { value: 1e51, symbol: "SxD" },   
        { value: 1e48, symbol: "QD" },    
        { value: 1e45, symbol: "QaD" },   
        { value: 1e42, symbol: "TD" },    
        { value: 1e39, symbol: "DD" },    
        { value: 1e36, symbol: "UD" },    
        { value: 1e33, symbol: "Dc" },    
        { value: 1e30, symbol: "No" },    
        { value: 1e27, symbol: "Oc" },    
        { value: 1e24, symbol: "Sp" },    
        { value: 1e21, symbol: "Sx" },    
        { value: 1e18, symbol: "Qa" },    
        { value: 1e15, symbol: "Q" },     
        { value: 1e12, symbol: "T" },     
        { value: 1e9, symbol: "B" },      
        { value: 1e6, symbol: "M" },      
        { value: 1e3, symbol: "K" }       
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    const item = lookup.find(item => amount >= item.value);
    return item ? (amount / item.value).toFixed(2).replace(rx, "$1") + " " + item.symbol : amount.toLocaleString();
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

async function getProfilePicture(uid) {
    try {
        const avatarURL = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        const response = await axios.get(avatarURL, { responseType: 'arraybuffer', timeout: 10000 });
        return await loadImage(Buffer.from(response.data));
    } catch {
        return null;
    }
}

async function createBalanceCard(userData, userID, balance) {
    const width = 1000;
    const height = 580;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // 1. Background
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, COLORS.background[0]);
    bgGrad.addColorStop(0.5, COLORS.background[1]);
    bgGrad.addColorStop(1, COLORS.background[2]);
    drawRoundedRect(ctx, 0, 0, width, height, 35);
    ctx.fillStyle = bgGrad;
    ctx.fill();

    // Grid effect
    ctx.strokeStyle = 'rgba(46, 204, 113, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 30) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke(); }
    for (let i = 0; i < height; i += 30) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke(); }

    // 2. Glassmorphism Balance Area
    ctx.save();
    ctx.fillStyle = COLORS.glass;
    drawRoundedRect(ctx, 40, 150, 650, 180, 20);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.stroke();
    ctx.restore();

    // 3. Labels
    ctx.fillStyle = COLORS.white;
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText('BALANCE CARD', 60, 80);
    
    ctx.fillStyle = COLORS.accent;
    ctx.font = '600 14px sans-serif';
    ctx.fillText('SECURE DIGITAL WALLET', 60, 105);

    ctx.fillStyle = COLORS.textSecondary;
    ctx.font = '500 16px sans-serif';
    ctx.fillText('CURRENT NET WORTH', 75, 200);

    // 4. Large Balance Handling
    const balFormatted = `${CURRENCY_SYMBOL}${formatMoney(balance)}`;
    let fontSize = 80;
    if (balFormatted.length > 12) fontSize = 60;
    if (balFormatted.length > 18) fontSize = 45;

    ctx.font = `bold ${fontSize}px sans-serif`;
    const balGrad = ctx.createLinearGradient(60, 220, 500, 280);
    balGrad.addColorStop(0, '#ffffff');
    balGrad.addColorStop(1, COLORS.accent);
    ctx.fillStyle = balGrad;
    ctx.shadowColor = 'rgba(46, 204, 113, 0.4)';
    ctx.shadowBlur = 20;
    ctx.fillText(balFormatted, 70, 280);
    ctx.shadowBlur = 0;

    // 5. User Details
    ctx.fillStyle = COLORS.textSecondary;
    ctx.font = '600 14px sans-serif';
    ctx.fillText('OWNER / HOLDER', 60, 420);
    
    ctx.fillStyle = COLORS.white;
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText((userData.name || "N/A").toUpperCase(), 60, 460);

    ctx.fillStyle = COLORS.accent;
    ctx.font = '600 16px sans-serif';
    ctx.fillText(`ID: ${userID}`, 60, 495);

    // 6. Profile Pic
    const picSize = 180;
    const picX = width - picSize - 70;
    const picY = 70;

    ctx.beginPath();
    ctx.arc(picX + picSize/2, picY + picSize/2, picSize/2 + 10, 0, Math.PI * 2);
    ctx.strokeStyle = COLORS.accent;
    ctx.lineWidth = 3;
    ctx.stroke();

    const profilePic = await getProfilePicture(userID);
    if (profilePic) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(picX + picSize/2, picY + picSize/2, picSize/2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(profilePic, picX, picY, picSize, picSize);
        ctx.restore();
    }

    // 7. Chip
    const chipX = width - 150, chipY = 320;
    const chipG = ctx.createLinearGradient(chipX, chipY, chipX+80, chipY+60);
    chipG.addColorStop(0, '#f1c40f'); chipG.addColorStop(1, '#d35400');
    drawRoundedRect(ctx, chipX, chipY, 80, 60, 10);
    ctx.fillStyle = chipG;
    ctx.fill();

    // 8. Status Badge
    ctx.fillStyle = 'rgba(46, 204, 113, 0.15)';
    drawRoundedRect(ctx, width - 220, height - 100, 150, 50, 25);
    ctx.fill();
    ctx.fillStyle = COLORS.accent;
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('● ACTIVE', width - 145, height - 68);

    return canvas.toBuffer('image/png');
}

module.exports = {
    config: {
        name: "balancec",
        aliases: ["bal", "wallet", "wcard"],
        version: "3.5.0",
        author: "SiFu",
        countDown: 10,
        role: 0,
        category: "economy",
        description: "Display card with support for Centillion values."
    },

    onStart: async function({ message, event, usersData, args }) {
        try {
            message.reaction("⚡", event.messageID);
            await fs.ensureDir(cacheDir);

            let targetID = event.messageReply?.senderID || Object.keys(event.mentions)[0] || args[0] || event.senderID;
            const userData = await usersData.get(targetID);
            
            if (!userData) return message.reply("User not found!");

            const buffer = await createBalanceCard(userData, targetID, userData.money || 0);
            const imagePath = path.join(cacheDir, `bal_${targetID}.png`);
            
            await fs.writeFile(imagePath, buffer);

            // Send only the attachment (No text body)
            await message.reply({
                attachment: fs.createReadStream(imagePath)
            });

            message.reaction("💕", event.messageID);
            setTimeout(() => { if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath); }, 15000);

        } catch (e) {
            console.log(e);
            message.reply("UI Generation Failed!");
        }
    }
};